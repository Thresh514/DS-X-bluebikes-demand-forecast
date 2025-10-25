from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS
from test import model

app = Flask(__name__)
CORS(app)  # 允许 Next.js 请求

# 使用模拟模型
# model = joblib.load("models/xgb_model.pkl")  # 真实模型

@app.route("/")
def home():
    return {"status": "Flask backend running"}

@app.route("/predict", methods=["POST"])
def predict():
    """
    预测车站单车进出量
    
    期望的JSON格式:
    单个车站:
    {
        "temperature": 20,          // 温度 (从天气API获取)
        "rainfall": 0,              // 降雨量 (从天气API获取)
        "hour_of_week": 48,         // 一周中的小时
        "isWeekend": 0,             // 是否周末
        "month": 6,                 // 月份
        "prediction_minutes": 30,   // 预测未来的分钟数 (0-60)
        "longitude": -71.0589,      // 车站经度 (常量)
        "latitude": 42.3601         // 车站纬度 (常量)
    }
    
    多个车站(数组):
    [
        {...},  // 车站1
        {...}   // 车站2
    ]
    
    返回格式:
    {
        "predictions": [
            {"arrivals": 10, "departures": 8},
            {"arrivals": 15, "departures": 12}
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
