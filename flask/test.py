from joblib import load
import pandas as pd
import numpy as np

class RealModelWrapper:
    """
    真实模型的包装类，用于接入 Flask API
    """
    
    def __init__(self, model_path='model.joblib'):
        # 加载真实训练的模型
        print(f"📦 正在加载模型: {model_path}")
        self.model = load(model_path)
        print(f"✅ 模型加载成功！")
    
    def predict(self, data):
        """
        预测单车进出量
        
        参数:
            data: DataFrame 或 dict，包含以下列:
                - temperature: 温度 (°C) - 从API获取
                - rainfall: 降雨量 (mm) - 从API获取
                - hour_of_week: 一周中的小时 (0-167)
                - isWeekend: 是否周末 (0 or 1)
                - month: 月份 (1-12)
                - prediction_minutes: 预测未来的分钟数 (0-60)
                - longitude: 车站经度
                - latitude: 车站纬度
        
        返回:
            dict: {
                'arrivals': 进站单车数量数组,
                'departures': 出站单车数量数组
            }
        """
        print("\n" + "="*50)
        print("🚴 开始预测...")
        
        if isinstance(data, dict):
            data = pd.DataFrame([data])
        
        print(f"📊 输入数据行数: {len(data)}")
        
        # 将 API 传入的参数映射到模型需要的特征
        X_input = pd.DataFrame()
        
        for idx, row in data.iterrows():
            # 从 hour_of_week 和 prediction_minutes 计算时间特征
            hour_of_week = row.get('hour_of_week', 0)
            prediction_minutes = row.get('prediction_minutes', 0)
            
            print(f"\n📍 站点 #{idx + 1}:")
            print(f"   🌡️  温度: {row.get('temperature', 20)}°C")
            print(f"   🌧️  降雨: {row.get('rainfall', 0)}mm")
            print(f"   ⏰ 一周小时: {hour_of_week}")
            print(f"   📅 是否周末: {'是' if row.get('isWeekend', 0) else '否'}")
            print(f"   📆 月份: {row.get('month', 6)}")
            print(f"   ⏱️  预测分钟: {prediction_minutes}")
            print(f"   📌 位置: ({row.get('latitude', 42.35)}, {row.get('longitude', -71.08)})")
            
            # 计算预测时间范围
            start_hour = hour_of_week
            end_hour = hour_of_week + (prediction_minutes / 60.0)
            
            # 构建模型输入特征
            features = {
                "start_hour_of_week": start_hour,
                "end_hour_of_week": end_hour,
                "is_weekend": row.get('isWeekend', 0),
                "month": row.get('month', 6),
                "station_id": row.get('station_id', 325),  # 默认站点ID
                "latitude": row.get('latitude', 42.35),
                "longitude": row.get('longitude', -71.08)
            }
            
            X_input = pd.concat([X_input, pd.DataFrame([features])], ignore_index=True)
        
        # 使用真实模型进行预测
        print(f"\n🔮 正在使用模型预测...")
        predictions = self.model.predict(X_input)
        
        # 解析预测结果
        # 假设模型返回的是 [arrivals, departures] 或单个值
        arrivals = []
        departures = []
        
        print(f"\n✨ 预测结果:")
        for i, pred in enumerate(predictions):
            # 如果是单个值，则假设 arrivals = departures = pred/2
            if isinstance(pred, (int, float, np.integer, np.floating)):
                arrival = int(pred * 0.5)
                departure = int(pred * 0.5)
            else:
                # 如果是数组，取前两个值
                arrival = int(pred[0]) if len(pred) > 0 else 0
                departure = int(pred[1]) if len(pred) > 1 else 0
            
            arrivals.append(arrival)
            departures.append(departure)
            
            print(f"   站点 #{i + 1}: 进站 ⬇️  {arrival} 辆 | 出站 ⬆️  {departure} 辆")
        
        print("="*50 + "\n")
        
        return {
            'arrivals': np.array(arrivals),
            'departures': np.array(departures)
        }


# 创建全局模型实例供 app.py 使用
model = RealModelWrapper()


# 测试代码（仅在直接运行此文件时执行）
if __name__ == "__main__":
    # 准备测试输入数据
    test_data = {
        "temperature": 20,
        "rainfall": 0,
        "hour_of_week": 30,
        "isWeekend": 0,
        "month": 7,
        "prediction_minutes": 30,
        "station_id": 325,
        "latitude": 42.35,
        "longitude": -71.08
    }
    
    # 预测
    result = model.predict(test_data)
    print("预测结果:")
    print(f"  进站 (arrivals): {result['arrivals']}")
    print(f"  出站 (departures): {result['departures']}")
