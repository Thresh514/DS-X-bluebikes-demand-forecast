import numpy as np
import pandas as pd

class BikeShareSimulator:
    """
    模拟的共享单车需求预测模型
    预测每个站点的单车进出量
    """
    
    def __init__(self):
        # 设置随机种子以获得可重复的结果
        np.random.seed(42)
        
        # 定义各个特征的权重（模拟真实模型的影响因子）
        self.weights = {
            'temperature': 0.35,      # 温度对需求的影响
            'rainfall': -0.15,        # 降雨负向影响
            'hour_factor': 0.65,      # 小时是最重要的因素
            'weekend_factor': 0.15,   # 周末因素
            'month_factor': 0.20,     # 月份因素（季节性）
        }
        
        # 基础活动量（增加到原来的3倍）
        self.base_activity = 36
        
    def predict(self, data):
        """
        预测单车进出量
        
        参数:
            data: DataFrame 包含以下列:
                - temperature: 温度 (°C) - 从API获取
                - rainfall: 降雨量 (mm) - 从API获取
                - hour_of_week: 一周中的小时 (0-167)
                - isWeekend: 是否周末 (0 or 1)
                - month: 月份 (1-12)
                - prediction_minutes: 预测未来的分钟数 (0-60)
                - longitude: 车站经度 (常量)
                - latitude: 车站纬度 (常量)
        
        返回:
            dict: {
                'arrivals': 进站单车数量数组,
                'departures': 出站单车数量数组
            }
        """
        if isinstance(data, dict):
            data = pd.DataFrame([data])
        
        arrivals = []
        departures = []
        
        for idx, row in data.iterrows():
            # 提取特征
            temperature = row.get('temperature', 20)
            rainfall = row.get('rainfall', 0)
            hour_of_week = row.get('hour_of_week', 0)
            is_weekend = row.get('isWeekend', 0)
            month = row.get('month', 6)
            prediction_minutes = row.get('prediction_minutes', 0)  # 0-60分钟
            longitude = row.get('longitude', -71.0589)
            latitude = row.get('latitude', 42.3601)
            
            # 计算各个因素的得分
            
            # 1. 温度因素 (10-30°C最舒适，得分最高)
            if 15 <= temperature <= 25:
                temp_score = 1.0
            elif temperature < 15:
                temp_score = max(0, (temperature + 5) / 20)
            else:
                temp_score = max(0, 1 - (temperature - 25) / 15)
            
            # 2. 降雨因素 (降雨越多，需求越低)
            rain_score = max(0, 1 - rainfall / 10)
            
            # 3. 小时因素 (模拟一天中的高峰时段)
            hour_of_day = hour_of_week % 24
            
            # 通勤高峰: 7-9点和17-19点
            if 7 <= hour_of_day <= 9 or 17 <= hour_of_day <= 19:
                hour_score = 2.5  # 高峰时段（大幅增加）
            elif 10 <= hour_of_day <= 16:
                hour_score = 1.8  # 白天正常时段（增加）
            elif 20 <= hour_of_day <= 22:
                hour_score = 1.2  # 晚上（增加）
            else:
                hour_score = 0.6  # 深夜/清晨（增加）
            
            # 4. 周末因素
            if is_weekend:
                weekend_score = 0.85  # 周末需求略低于工作日
                # 周末高峰时段调整
                if 10 <= hour_of_day <= 18:
                    hour_score = 2.0  # 周末白天活动时段（增加）
            else:
                weekend_score = 1.0
            
            # 5. 月份因素 (季节性，春夏需求高)
            month_scores = {
                1: 0.6,  2: 0.65, 3: 0.8,   # 冬春
                4: 0.95, 5: 1.1,  6: 1.2,   # 春夏
                7: 1.2,  8: 1.15, 9: 1.1,   # 夏秋
                10: 0.9, 11: 0.7, 12: 0.6   # 秋冬
            }
            month_score = month_scores.get(month, 1.0)
            
            # 6. 地理位置因素 (车站位置常量)
            # 波士顿市中心: lat ≈ 42.36, lon ≈ -71.06
            distance_from_center = np.sqrt(
                (latitude - 42.36)**2 + (longitude + 71.06)**2
            )
            # 距离市中心越近，需求越高
            location_score = max(0.5, 1 - distance_from_center * 20)
            
            # 综合计算基础活动量
            base_activity = self.base_activity * (
                1 +
                self.weights['temperature'] * temp_score +
                self.weights['rainfall'] * rain_score +
                self.weights['hour_factor'] * hour_score +
                self.weights['weekend_factor'] * weekend_score +
                self.weights['month_factor'] * month_score
            ) * location_score
            
            # 计算进出比例（基于时段和位置）
            # 判断是否在市中心区域（距离市中心较近）
            is_downtown = distance_from_center < 0.05
            
            # 早高峰 (7-9点)
            if 7 <= hour_of_day <= 9:
                if is_downtown:
                    # 市中心：更多人骑车到达（上班）- 差值更大
                    arrival_ratio = 0.80
                    departure_ratio = 0.20
                else:
                    # 住宅区：更多人骑车离开（去上班）- 差值更大
                    arrival_ratio = 0.20
                    departure_ratio = 0.80
            # 晚高峰 (17-19点)
            elif 17 <= hour_of_day <= 19:
                if is_downtown:
                    # 市中心：更多人骑车离开（下班）- 差值更大
                    arrival_ratio = 0.20
                    departure_ratio = 0.80
                else:
                    # 住宅区：更多人骑车到达（下班回家）- 差值更大
                    arrival_ratio = 0.80
                    departure_ratio = 0.20
            # 午休时段 (11-14点)
            elif 11 <= hour_of_day <= 14:
                # 午餐时间，略有不平衡
                arrival_ratio = 0.60
                departure_ratio = 0.40
            # 其他时段
            else:
                # 有一定波动
                arrival_ratio = 0.40
                departure_ratio = 0.60
            
            # 周末调整：周末进出也有差异
            if is_weekend:
                arrival_ratio = 0.55 + np.random.uniform(-0.10, 0.10)
                departure_ratio = 1 - arrival_ratio
            
            # 计算arrivals和departures
            arrival_count = base_activity * arrival_ratio
            departure_count = base_activity * departure_ratio
            
            # 时间预测因子 (0-60分钟)
            # 预测时间越远，不确定性越高，同时考虑需求的时间累积
            # 将分钟转换为小时的比例用于计算
            time_ratio = prediction_minutes / 60.0  # 0到1之间
            
            # 根据预测时间调整预测值
            # 短期预测（0-30分钟）：线性增长
            # 长期预测（30-60分钟）：增速放缓
            if prediction_minutes <= 30:
                time_factor = 0.5 + (time_ratio * 1.0)  # 0.5 到 1.0
            else:
                time_factor = 1.0 + ((time_ratio - 0.5) * 0.4)  # 1.0 到 1.2
            
            arrival_count = arrival_count * time_factor
            departure_count = departure_count * time_factor
            
            # 添加随机噪声，预测时间越远噪声越大
            noise_scale = 2.0 + (prediction_minutes / 60.0) * 2.0  # 2.0到4.0（增加噪声幅度）
            arrival_noise = np.random.normal(0, noise_scale)
            departure_noise = np.random.normal(0, noise_scale)
            
            arrival_count = max(0, arrival_count + arrival_noise)
            departure_count = max(0, departure_count + departure_noise)
            
            # 四舍五入到整数（单车数量）
            arrivals.append(round(arrival_count))
            departures.append(round(departure_count))
        
        return {
            'arrivals': np.array(arrivals),
            'departures': np.array(departures)
        }
    
    def predict_single(self, temperature, rainfall, 
                      hour_of_week, isWeekend, month, 
                      prediction_minutes, longitude, latitude):
        """
        单个车站预测的便捷方法
        
        参数:
            temperature: 温度 (从API获取)
            rainfall: 降雨量 (从API获取)
            hour_of_week: 一周中的小时
            isWeekend: 是否周末
            month: 月份
            prediction_minutes: 预测未来的分钟数 (0-60)
            longitude: 车站经度 (常量)
            latitude: 车站纬度 (常量)
        
        返回:
            dict: {'arrivals': int, 'departures': int}
        """
        data = {
            'temperature': temperature,
            'rainfall': rainfall,
            'hour_of_week': hour_of_week,
            'isWeekend': isWeekend,
            'month': month,
            'prediction_minutes': prediction_minutes,
            'longitude': longitude,
            'latitude': latitude
        }
        result = self.predict(data)
        return {
            'arrivals': int(result['arrivals'][0]),
            'departures': int(result['departures'][0])
        }


# 创建全局模型实例
model = BikeShareSimulator()

