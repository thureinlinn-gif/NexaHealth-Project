"""
Flask web application for wound image classification.
Demo front-end for testing the wound detection model.
"""

import os
import pickle
import base64
import io
import numpy as np
from flask import Flask, render_template, request, jsonify, Response
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
from joblib import load as joblib_load
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from dotenv import load_dotenv
from chat_handler import chat_with_context
from wallet_auth import get_wallet_from_request, validate_wallet_address
import sqlite3
from datetime import datetime

# Use absolute paths based on script location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load environment variables from .env file (in parent directory)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(BASE_DIR), '.env'))

app = Flask(__name__)

# Database for wallet-based chat history
DB_PATH = os.path.join(BASE_DIR, 'chat_history.db')

def init_db():
    """Initialize SQLite database for chat history."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            wallet_address TEXT NOT NULL,
            title TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id TEXT NOT NULL,
            wallet_address TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id)
        )
    ''')
    c.execute('''
        CREATE INDEX IF NOT EXISTS idx_wallet_address ON conversations(wallet_address)
    ''')
    c.execute('''
        CREATE INDEX IF NOT EXISTS idx_messages_wallet ON messages(wallet_address)
    ''')
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()
# Enable CORS with specific configuration for frontend
CORS(app, resources={
    r"/predict": {"origins": "*"},
    r"/chat": {"origins": "*"},
    r"/health": {"origins": "*"},
    r"/*": {"origins": "*"}
}, supports_credentials=True)
app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load model and class names
MODEL_PATH = os.path.join(BASE_DIR, 'wound_classifier.joblib')
CLASS_NAMES_PATH = os.path.join(BASE_DIR, 'class_names.pkl')
IMG_SIZE = (224, 224)  # Keep in sync with training script

model = None
class_names = None
feature_extractor = None

def load_model():
    """Load the trained scikit-learn classifier and MobileNet backbone."""
    global model, class_names, feature_extractor

    if not (os.path.exists(MODEL_PATH) and os.path.exists(CLASS_NAMES_PATH)):
        print("Model files not found. Please train the classifier first.")
        return False

    try:
        print(f"Loading classifier from {MODEL_PATH}...")
        model = joblib_load(MODEL_PATH)

        with open(CLASS_NAMES_PATH, 'rb') as f:
            class_names = pickle.load(f)

        feature_extractor = MobileNetV2(
            input_shape=(*IMG_SIZE, 3),
            include_top=False,
            pooling='avg',
            weights='imagenet'
        )
        feature_extractor.trainable = False

        print(f"Classifier loaded. Classes: {class_names}")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        model = None
        feature_extractor = None
        return False

def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def preprocess_image(image_path=None, image_data=None):
    """Preprocess image for model prediction.
    
    Args:
        image_path: Path to image file (optional)
        image_data: PIL Image object or base64 string (optional)
    """
    if image_data is not None:
        if isinstance(image_data, str):
            # Handle base64 string
            if image_data.startswith('data:image'):
                # Remove data URL prefix
                image_data = image_data.split(',')[1]
            img_data = base64.b64decode(image_data)
            img = Image.open(io.BytesIO(img_data))
        else:
            # Assume it's a PIL Image
            img = image_data
    else:
        # Load from file path
        img = Image.open(image_path)
    
    img = img.convert('RGB')
    img = img.resize(IMG_SIZE)
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def predict_image(image_path=None, image_data=None):
    """Predict wound type from image.
    
    Args:
        image_path: Path to image file (optional)
        image_data: PIL Image object or base64 string (optional)
    """
    if model is None or feature_extractor is None:
        return None, "Model not loaded. Please train the model first."
    
    try:
        # Preprocess image
        img_array = preprocess_image(image_path=image_path, image_data=image_data)
        img_array = preprocess_input(img_array.copy())
        
        # Extract features
        features = feature_extractor.predict(img_array, verbose=0)
        
        # Scikit-learn prediction
        predictions = model.predict_proba(features)[0]
        predicted_class_idx = int(np.argmax(predictions))
        confidence = float(predictions[predicted_class_idx])
        predicted_class = class_names[predicted_class_idx]
        
        # Get top 3 predictions
        top_3_indices = np.argsort(predictions)[-3:][::-1]
        top_3_predictions = [
            {
                'class': class_names[idx],
                'confidence': float(predictions[idx])
            }
            for idx in top_3_indices
        ]
        
        return {
            'predicted_class': predicted_class,
            'confidence': confidence,
            'top_3': top_3_predictions
        }, None
    except Exception as e:
        return None, str(e)

@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    """Handle image upload and prediction.
    Accepts either:
    - multipart/form-data with 'file' field
    - JSON with 'image' field (base64 encoded string)
    """
    if model is None or feature_extractor is None:
        return jsonify({'error': 'Model not loaded. Please train the model first.'}), 500
    
    try:
        # Check if request is JSON (base64 image) or multipart (file upload)
        if request.is_json:
            data = request.get_json()
            image_data = data.get('image')
            
            if not image_data:
                return jsonify({'error': 'No image data provided'}), 400
            
            # Make prediction from base64 image
            result, error = predict_image(image_data=image_data)
            
            if error:
                return jsonify({'error': error}), 500
            
            # Return format matching frontend expectations
            return jsonify({
                'label': result['predicted_class'],
                'confidence': result['confidence']
            })
        else:
            # Handle multipart file upload (for backward compatibility)
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400
            
            file = request.files['file']
            
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            if not allowed_file(file.filename):
                return jsonify({'error': 'Invalid file type. Please upload a JPG, PNG, or GIF image.'}), 400
            
            # Save uploaded file
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Make prediction
            result, error = predict_image(image_path=filepath)
            
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
            
            if error:
                return jsonify({'error': error}), 500
            
            # Return format matching frontend expectations
            return jsonify({
                'label': result['predicted_class'],
                'confidence': result['confidence']
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health():
    """Health check endpoint."""
    model_loaded = model is not None and feature_extractor is not None
    return jsonify({
        'status': 'healthy',
        'model_loaded': model_loaded,
        'classes': list(class_names) if class_names is not None else None
    })

@app.route('/chat', methods=['POST'])
def chat():
    """Handle chat messages from frontend using Gemini AI.
    Stores messages by wallet address for cross-platform access.
    """
    try:
        data = request.get_json()
        messages = data.get('messages', [])
        wallet_address = get_wallet_from_request(request) or data.get('wallet_address')
        conversation_id = data.get('conversation_id')
        
        if not messages:
            return jsonify({'error': 'No messages provided'}), 400
        
        # Get response from chat handler
        response_text = chat_with_context(messages)
        
        # Store messages if wallet address is provided
        if wallet_address and validate_wallet_address(wallet_address):
            import uuid
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            
            # Create conversation if needed
            if not conversation_id:
                conversation_id = str(uuid.uuid4())
                last_user_message = next((m for m in reversed(messages) if m.get('role') == 'user'), None)
                title = (last_user_message.get('content', 'New Chat')[:50] if last_user_message else 'New Chat')
                
                c.execute('''
                    INSERT OR REPLACE INTO conversations (id, wallet_address, title, updated_at)
                    VALUES (?, ?, ?, ?)
                ''', (conversation_id, wallet_address.lower(), title, datetime.now()))
            
            # Save user message
            last_user_msg = next((m for m in reversed(messages) if m.get('role') == 'user'), None)
            if last_user_msg:
                c.execute('''
                    INSERT INTO messages (conversation_id, wallet_address, role, content)
                    VALUES (?, ?, ?, ?)
                ''', (conversation_id, wallet_address.lower(), 'user', last_user_msg.get('content', '')))
            
            # Save assistant response
            c.execute('''
                INSERT INTO messages (conversation_id, wallet_address, role, content)
                VALUES (?, ?, ?, ?)
            ''', (conversation_id, wallet_address.lower(), 'assistant', response_text))
            
            # Update conversation timestamp
            c.execute('''
                UPDATE conversations SET updated_at = ? WHERE id = ?
            ''', (datetime.now(), conversation_id))
            
            conn.commit()
            conn.close()
        
        return jsonify({
            'choices': [{
                'delta': {
                    'content': response_text
                }
            }],
            'conversation_id': conversation_id
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/chat/history', methods=['GET'])
def get_chat_history():
    """Get chat history for a wallet address."""
    wallet_address = get_wallet_from_request(request) or request.args.get('wallet_address')
    
    if not wallet_address or not validate_wallet_address(wallet_address):
        return jsonify({'error': 'Valid wallet address required'}), 400
    
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        # Get conversations
        c.execute('''
            SELECT id, title, created_at, updated_at
            FROM conversations
            WHERE wallet_address = ?
            ORDER BY updated_at DESC
        ''', (wallet_address.lower(),))
        
        conversations = []
        for row in c.fetchall():
            conversations.append({
                'id': row[0],
                'title': row[1],
                'created_at': row[2],
                'updated_at': row[3]
            })
        
        conn.close()
        return jsonify({'conversations': conversations})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/chat/conversation/<conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    """Get messages for a specific conversation."""
    wallet_address = get_wallet_from_request(request) or request.args.get('wallet_address')
    
    if not wallet_address or not validate_wallet_address(wallet_address):
        return jsonify({'error': 'Valid wallet address required'}), 400
    
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        # Verify conversation belongs to wallet
        c.execute('''
            SELECT wallet_address FROM conversations WHERE id = ?
        ''', (conversation_id,))
        result = c.fetchone()
        
        if not result or result[0].lower() != wallet_address.lower():
            conn.close()
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Get messages
        c.execute('''
            SELECT role, content, created_at
            FROM messages
            WHERE conversation_id = ? AND wallet_address = ?
            ORDER BY created_at ASC
        ''', (conversation_id, wallet_address.lower()))
        
        messages = []
        for row in c.fetchall():
            messages.append({
                'role': row[0],
                'content': row[1],
                'created_at': row[2]
            })
        
        conn.close()
        return jsonify({'messages': messages})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/wallet/link-telegram', methods=['POST'])
def link_telegram_wallet():
    """Link a Telegram user ID to a wallet address."""
    data = request.get_json()
    telegram_user_id = data.get('telegram_user_id')
    wallet_address = data.get('wallet_address')
    signature = data.get('signature')  # Signature proving wallet ownership
    
    if not all([telegram_user_id, wallet_address, signature]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if not validate_wallet_address(wallet_address):
        return jsonify({'error': 'Invalid wallet address'}), 400
    
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        # Create wallet-telegram link table if needed
        c.execute('''
            CREATE TABLE IF NOT EXISTS wallet_telegram_links (
                telegram_user_id TEXT PRIMARY KEY,
                wallet_address TEXT NOT NULL,
                linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Store the link
        c.execute('''
            INSERT OR REPLACE INTO wallet_telegram_links (telegram_user_id, wallet_address)
            VALUES (?, ?)
        ''', (str(telegram_user_id), wallet_address.lower()))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Wallet linked successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # Load model on startup
    load_model()
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5001)

