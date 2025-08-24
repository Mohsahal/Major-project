"""
Example of lazy loading ML libraries in Flask applications.

This pattern ensures that heavy ML libraries like transformers, torch, etc.
are only loaded when actually needed, improving startup time and memory usage.
"""

# Global variables to store lazy-loaded components
_transformer_model = None
_torch_components = None
_tensorflow_components = None

def get_transformer_model():
    """
    Lazy load a transformer model only when needed.
    
    Returns:
        The loaded transformer model
    """
    global _transformer_model
    
    if _transformer_model is None:
        try:
            from transformers import AutoTokenizer, AutoModel
            print("Loading transformer model...")
            
            # Load model only when first called
            _transformer_model = {
                'tokenizer': AutoTokenizer.from_pretrained('bert-base-uncased'),
                'model': AutoModel.from_pretrained('bert-base-uncased')
            }
            print("Transformer model loaded successfully")
            
        except ImportError as e:
            print(f"Error importing transformers: {e}")
            raise ImportError("transformers not installed. Please install with: pip install transformers")
        except Exception as e:
            print(f"Error loading transformer model: {e}")
            raise
    
    return _transformer_model

def get_torch_components():
    """
    Lazy load PyTorch components only when needed.
    
    Returns:
        Dictionary containing torch components
    """
    global _torch_components
    
    if _torch_components is None:
        try:
            import torch
            import torch.nn as nn
            import torch.optim as optim
            
            print("Loading PyTorch components...")
            
            _torch_components = {
                'torch': torch,
                'nn': nn,
                'optim': optim
            }
            print("PyTorch components loaded successfully")
            
        except ImportError as e:
            print(f"Error importing PyTorch: {e}")
            raise ImportError("PyTorch not installed. Please install with: pip install torch")
        except Exception as e:
            print(f"Error loading PyTorch components: {e}")
            raise
    
    return _torch_components

def get_tensorflow_components():
    """
    Lazy load TensorFlow components only when needed.
    
    Returns:
        Dictionary containing TensorFlow components
    """
    global _tensorflow_components
    
    if _tensorflow_components is None:
        try:
            import tensorflow as tf
            from tensorflow import keras
            
            print("Loading TensorFlow components...")
            
            _tensorflow_components = {
                'tf': tf,
                'keras': keras
            }
            print("TensorFlow components loaded successfully")
            
        except ImportError as e:
            print(f"Error importing TensorFlow: {e}")
            raise ImportError("TensorFlow not installed. Please install with: pip install tensorflow")
        except Exception as e:
            print(f"Error loading TensorFlow components: {e}")
            raise
    
    return _tensorflow_components

# Example Flask route using lazy loading
def example_route_with_transformer():
    """
    Example Flask route that uses lazy loading for transformer model.
    """
    try:
        # Load model only when this route is called
        model_components = get_transformer_model()
        tokenizer = model_components['tokenizer']
        model = model_components['model']
        
        # Use the model for inference
        text = "Hello, this is a test sentence."
        inputs = tokenizer(text, return_tensors="pt")
        outputs = model(**inputs)
        
        return {"success": True, "message": "Transformer model used successfully"}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

def example_route_with_torch():
    """
    Example Flask route that uses lazy loading for PyTorch.
    """
    try:
        # Load PyTorch components only when needed
        torch_components = get_torch_components()
        torch = torch_components['torch']
        nn = torch_components['nn']
        
        # Create a simple neural network
        model = nn.Sequential(
            nn.Linear(10, 5),
            nn.ReLU(),
            nn.Linear(5, 1)
        )
        
        return {"success": True, "message": "PyTorch model created successfully"}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

def example_route_with_tensorflow():
    """
    Example Flask route that uses lazy loading for TensorFlow.
    """
    try:
        # Load TensorFlow components only when needed
        tf_components = get_tensorflow_components()
        tf = tf_components['tf']
        keras = tf_components['keras']
        
        # Create a simple model
        model = keras.Sequential([
            keras.layers.Dense(10, activation='relu'),
            keras.layers.Dense(1)
        ])
        
        return {"success": True, "message": "TensorFlow model created successfully"}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

# Example of how to use this in a Flask app
"""
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/analyze-text', methods=['POST'])
def analyze_text():
    # This will only load the transformer model when this route is called
    return jsonify(example_route_with_transformer())

@app.route('/create-torch-model', methods=['GET'])
def create_torch_model():
    # This will only load PyTorch when this route is called
    return jsonify(example_route_with_torch())

@app.route('/create-tf-model', methods=['GET'])
def create_tf_model():
    # This will only load TensorFlow when this route is called
    return jsonify(example_route_with_tensorflow())

if __name__ == '__main__':
    app.run(debug=True)
"""

# Benefits of this approach:
# 1. Faster startup time - heavy libraries aren't loaded until needed
# 2. Lower memory usage - only load what you use
# 3. Better error handling - can handle missing dependencies gracefully
# 4. Modular design - each component is loaded independently
# 5. Easier testing - can mock the loading functions for unit tests
