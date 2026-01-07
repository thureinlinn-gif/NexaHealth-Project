"""
Standalone evaluation script for the classical wound classifier.

Loads the fitted scikit-learn pipeline, recomputes MobileNetV2 features
for the dataset, and reports accuracy, precision/recall/F1, plus a confusion matrix.
"""

import os
import pickle

import numpy as np
from joblib import load
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

from train_model import (
    PRIMARY_DATA_DIR,
    EXTRA_DATA_DIRS,
    load_data,
    build_feature_extractor,
    extract_features,
    plot_confusion_matrix,
    REPORT_SAVE_PATH,
    CM_SAVE_PATH
)

# Use absolute paths based on script location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "wound_classifier.joblib")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "class_names.pkl")


def evaluate():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"{MODEL_PATH} not found. Train the model first.")
    if not os.path.exists(CLASS_NAMES_PATH):
        raise FileNotFoundError(f"{CLASS_NAMES_PATH} not found. Train the model first.")

    print("Loading classifier pipeline...")
    classifier = load(MODEL_PATH)

    with open(CLASS_NAMES_PATH, 'rb') as f:
        class_names = pickle.load(f)

    print("Loading dataset for evaluation...")
    images, labels, _ = load_data(PRIMARY_DATA_DIR, EXTRA_DATA_DIRS)
    feature_extractor = build_feature_extractor()
    features = extract_features(images, feature_extractor)

    # Recreate the same validation split (random_state=42) used during training
    _, X_val, _, y_val = train_test_split(
        features,
        labels,
        test_size=0.2,
        random_state=42,
        stratify=labels
    )

    print("Running evaluation...")
    y_pred = classifier.predict(X_val)
    accuracy = accuracy_score(y_val, y_pred)
    report = classification_report(y_val, y_pred, target_names=class_names, digits=4)
    cm = confusion_matrix(y_val, y_pred)

    print("\n" + "=" * 60)
    print("EVALUATION RESULTS")
    print("=" * 60)
    print(f"Accuracy: {accuracy*100:.2f}%")
    print(report)

    # Overwrite the existing report/CM files with the latest evaluation
    with open(REPORT_SAVE_PATH, 'w') as f:
        f.write(f"Evaluation Accuracy: {accuracy*100:.2f}%\n\n")
        f.write(report)
    print(f"Evaluation report saved to {REPORT_SAVE_PATH}")

    plot_confusion_matrix(cm, class_names, CM_SAVE_PATH)


if __name__ == "__main__":
    evaluate()


