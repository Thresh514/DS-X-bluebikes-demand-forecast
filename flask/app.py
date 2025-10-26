from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS
from test import model

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return {"status": "Flask backend running"}

@app.route("/predict", methods=["POST"])
def predict():
    """
    predict bike arrivals and departures
    
    expected JSON format:
    single station:
    {
        "temperature": 20,          // temperature
        "rainfall": 0,              // rainfall
        "hour_of_week": 48,         // hour_of_week
        "isWeekend": 0,             // isWeekend (0 or 1)
        "month": 6,                 // month (1-12)
        "prediction_minutes": 30,   // prediction_minutes (0-60)
        "longitude": -71.0589,      // longitude
        "latitude": 42.3601         // latitude
    }
    
    multiple stations (array):
    [
        {...},  // station 1
        {...}   // station 2
    ]
    
    return format:
    {
        "predictions": [
            {"arrivals": 10, "departures": 8},  // arrivals
            {"arrivals": 15, "departures": 12}  // departures
        ]
    }
    """
    try:
        data = request.get_json()
        
        if isinstance(data, dict):
            df = pd.DataFrame([data])
        else:
            df = pd.DataFrame(data)

        result = model.predict(df)
        predictions = []

        for i in range(len(result['arrivals'])):
            predictions.append({
                'arrivals': int(result['arrivals'][i]),
                'departures': int(result['departures'][i])
            })
        
        return jsonify({
            "predictions": predictions
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
