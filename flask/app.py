from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS
from simple_predictor import SimpleBikePredictor

print("=" * 60)
print("Using Simple Common Sense Predictor")
print("(Real model has numerical overflow issues)")
print("=" * 60)

model = SimpleBikePredictor()
print("✓ Predictor ready")
print("=" * 60)

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return {
        "status": "Flask backend running",
        "model": "Simple Common Sense Predictor",
        "version": "3.0"
    }

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data"}), 400

        # Predict
        result = model.predict(data if isinstance(data, list) else [data])

        # Format
        predictions = []
        for i in range(len(result['arrivals'])):
            predictions.append({
                'arrivals': int(result['arrivals'][i]),
                'departures': int(result['departures'][i])
            })

        return jsonify({
            "predictions": predictions,
            "model_type": "Simple Predictor",
            "num_stations": len(predictions)
        })

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
