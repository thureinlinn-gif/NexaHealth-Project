"""
Training script for wound classification using classical ML.

Uses:
  • Using MobileNetV2 only as a frozen feature extractor
  • Training a scikit-learn Logistic Regression classifier on top of those features
"""

import os
import pickle
import numpy as np
from PIL import Image

import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score
)

from joblib import dump
import matplotlib.pyplot as plt
import seaborn as sns

np.random.seed(42)
tf.random.set_seed(42)

# -------------------------------------------------------------
# Configuration - extensible dataset loading + classical model
# -------------------------------------------------------------
PRIMARY_DATA_DIR = "../Wound_dataset"
EXTRA_DATA_DIRS = [
    # "/absolute/path/to/another/wound_dataset",
]
IMG_SIZE = (224, 224)
UPSAMPLE_MINORITY_CLASSES = True
TARGET_SAMPLES_PER_CLASS = 600
MAX_SYNTHETIC_MULTIPLIER = 3
FEATURE_BATCH_SIZE = 64

MODEL_SAVE_PATH = "wound_classifier.joblib"
CLASS_NAMES_SAVE_PATH = "class_names.pkl"
REPORT_SAVE_PATH = "evaluation_report.txt"
CM_SAVE_PATH = "confusion_matrix.png"


def load_data(primary_dir, extra_dirs=None):
    """Load images/labels from one or more directories with identical classes."""
    if extra_dirs is None:
        extra_dirs = []

    dataset_dirs = [primary_dir] + list(extra_dirs)
    images = []
    labels = []

    class_names = sorted([
        d for d in os.listdir(primary_dir)
        if os.path.isdir(os.path.join(primary_dir, d))
    ])
    if not class_names:
        raise ValueError(f"No class folders found in {primary_dir}")

    print(f"Using primary dataset at: {os.path.abspath(primary_dir)}")
    print(f"Found {len(class_names)} classes: {class_names}")

    for dataset_dir in dataset_dirs:
        if not os.path.isdir(dataset_dir):
            print(f"  ! Skipping missing dataset: {dataset_dir}")
            continue

        dir_class_names = sorted([
            d for d in os.listdir(dataset_dir)
            if os.path.isdir(os.path.join(dataset_dir, d))
        ])

        if set(dir_class_names) != set(class_names):
            print(f"  - Dataset {dataset_dir} has different classes.")
            print(f"  - Expected: {class_names}")
            print(f"  - Found:    {dir_class_names}")
            print("   - Skipping this dataset to avoid label mismatch.\n")
            continue

        print(f"\nLoading dataset: {os.path.abspath(dataset_dir)}")

        for class_idx, class_name in enumerate(class_names):
            class_dir = os.path.join(dataset_dir, class_name)
            image_files = [
                f for f in os.listdir(class_dir)
                if f.lower().endswith(('.jpg', '.jpeg', '.png'))
            ]

            print(f"  {class_name}: {len(image_files)} images")

            for img_file in image_files:
                img_path = os.path.join(class_dir, img_file)
                try:
                    img = Image.open(img_path).convert('RGB').resize(IMG_SIZE)
                    img_array = np.array(img, dtype=np.float32)
                    images.append(img_array)
                    labels.append(class_idx)
                except Exception as e:
                    print(f"Error loading {img_path}: {e}")
                    continue

    if not images:
        raise ValueError("No images were loaded. Please check dataset paths.")

    return np.stack(images), np.array(labels), class_names


def upsample_dataset(images, labels, class_names):
    """Artificially grow minority classes to simulate a larger dataset."""
    if not UPSAMPLE_MINORITY_CLASSES or TARGET_SAMPLES_PER_CLASS <= 0:
        return images, labels

    print("\nUpsampling minority classes to simulate a larger dataset...")
    augmenter = ImageDataGenerator(
        rotation_range=25,
        width_shift_range=0.15,
        height_shift_range=0.15,
        shear_range=0.1,
        horizontal_flip=True,
        zoom_range=0.15,
        fill_mode='nearest'
    )

    expanded_images = list(images)
    expanded_labels = list(labels)

    for class_idx, class_name in enumerate(class_names):
        class_mask = labels == class_idx
        class_images = images[class_mask]
        current_count = class_images.shape[0]
        target_count = min(TARGET_SAMPLES_PER_CLASS, current_count * MAX_SYNTHETIC_MULTIPLIER)
        deficit = target_count - current_count

        if deficit <= 0 or current_count == 0:
            print(f"  {class_name}: {current_count} images (no upsampling needed)")
            continue

        print(f"  {class_name}: {current_count} images -> adding {deficit} synthetic samples")
        flow = augmenter.flow(class_images, batch_size=1, shuffle=True, seed=42)
        for _ in range(deficit):
            augmented_batch = next(flow)
            expanded_images.append(augmented_batch[0])
            expanded_labels.append(class_idx)

    expanded_images = np.array(expanded_images, dtype=np.float32)
    expanded_labels = np.array(expanded_labels)

    print(f"\nDataset size after upsampling: {expanded_images.shape[0]} images")
    return expanded_images, expanded_labels


def build_feature_extractor():
    """Create a frozen MobileNetV2 backbone for feature extraction."""
    model = MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        pooling='avg',
        weights='imagenet'
    )
    model.trainable = False
    return model


def extract_features(images, feature_extractor, batch_size=FEATURE_BATCH_SIZE):
    """Convert images into feature vectors using the frozen backbone."""
    features = []
    for start in range(0, len(images), batch_size):
        end = start + batch_size
        batch = images[start:end].copy()
        batch = preprocess_input(batch)
        feats = feature_extractor.predict(batch, verbose=0)
        features.append(feats)
    return np.vstack(features)


def plot_confusion_matrix(cm, class_names, save_path):
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=class_names, yticklabels=class_names)
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Confusion Matrix')
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Confusion matrix saved to {save_path}")


def save_report(report_text, accuracy, path):
    with open(path, 'w') as f:
        f.write(f"Validation Accuracy: {accuracy*100:.2f}%\n\n")
        f.write(report_text)
    print(f"Evaluation report saved to {path}")


def main():
    print("=" * 60)
    print("CLASSICAL TRAINING PIPELINE (MobileNetV2 features + Logistic Regression)")
    print("=" * 60)
    print("\nAdvantages:")
    print("  - No deep fine-tuning (faster & hackathon-friendly)")
    print("  - Still leverages ImageNet features for texture/edge cues")
    print("  - Logistic Regression with class balancing")
    print("  - Built-in evaluation report + confusion matrix")
    print("=" * 60 + "\n")

    images, labels, class_names = load_data(PRIMARY_DATA_DIR, EXTRA_DATA_DIRS)

    if UPSAMPLE_MINORITY_CLASSES:
        images, labels = upsample_dataset(images, labels, class_names)

    print(f"\nTotal images: {len(images)}")
    print("Per-class counts after optional upsampling:")
    for idx, name in enumerate(class_names):
        print(f"  {name}: {(labels == idx).sum()} images")

    feature_extractor = build_feature_extractor()
    features = extract_features(images, feature_extractor)

    X_train, X_val, y_train, y_val = train_test_split(
        features,
        labels,
        test_size=0.2,
        random_state=42,
        stratify=labels
    )

    print(f"\nTraining classifier on {X_train.shape[0]} samples...")
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("logreg", LogisticRegression(
            max_iter=2000,
            class_weight='balanced',
            multi_class='multinomial',
            solver='lbfgs'
        ))
    ])
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_val)
    accuracy = accuracy_score(y_val, y_pred)
    report = classification_report(y_val, y_pred, target_names=class_names, digits=4)
    cm = confusion_matrix(y_val, y_pred)

    print("\n" + "=" * 60)
    print("VALIDATION RESULTS")
    print("=" * 60)
    print(f"Accuracy: {accuracy*100:.2f}%")
    print(report)

    save_report(report, accuracy, REPORT_SAVE_PATH)
    plot_confusion_matrix(cm, class_names, CM_SAVE_PATH)

    dump(pipeline, MODEL_SAVE_PATH)
    print(f"\nClassifier saved to {MODEL_SAVE_PATH}")

    with open(CLASS_NAMES_SAVE_PATH, 'wb') as f:
        pickle.dump(class_names, f)
    print(f"Class names saved to {CLASS_NAMES_SAVE_PATH}")

    print("\nTraining complete!")
    if accuracy >= 0.8:
        print("Target achieved: 80%+ accuracy.")
    elif accuracy >= 0.7:
        print("Solid result: 70%+ accuracy.")
    else:
        print("Need more data or merging similar classes.")


if __name__ == "__main__":
    main()