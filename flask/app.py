from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS

print("=" * 60)
print("Using ZINB (Zero-Inflated Negative Binomial) Model")
print("=" * 60)

# 尝试加载 ZINB 模型，如果失败则回退到简单预测器
try:
    from zinb_predictor import ZINBPredictor
    model = ZINBPredictor('zinb_models.pkl')
    print("✓ ZINB Predictor ready")
    model_type_class = ZINBPredictor
except Exception as e:
    print(f"✗ Error loading ZINB model: {e}")
    print("Falling back to Simple Predictor...")
    from simple_predictor import SimpleBikePredictor
    model = SimpleBikePredictor()
    model_type_class = SimpleBikePredictor
    print("✓ Simple Predictor ready (fallback)")

print("=" * 60)

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    model_type = "ZINB Model" if model_type_class.__name__ == "ZINBPredictor" else "Simple Predictor (fallback)"
    return {
        "status": "Flask backend running",
        "model": model_type,
        "version": "4.0"
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

        model_type = "ZINB Model" if model_type_class.__name__ == "ZINBPredictor" else "Simple Predictor"
        return jsonify({
            "predictions": predictions,
            "model_type": model_type,
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
