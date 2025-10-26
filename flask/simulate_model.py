import numpy as np
import pandas as pd

class BikeShareSimulator:
    """
    simulate bike share demand prediction model
    predict bike arrivals and departures for each station
    """
    
    def __init__(self):
        # set random seed to get reproducible results
        np.random.seed(42)
        
        # define weights for each feature (simulated real model influence factors)
        self.weights = {
            'temperature': 0.35,      # temperature influence on demand
            'rainfall': -0.15,        # rainfall negative influence
            'hour_factor': 0.65,      # hour is the most important factor
            'weekend_factor': 0.15,   # weekend factor
            'month_factor': 0.20,     # month factor (seasonal)
        }
        
        # base activity (increase to 3 times original)
        self.base_activity = 36
        
    def predict(self, data):
        """
        predict bike arrivals and departures
        
        parameters:
            data: DataFrame containing the following columns:
                - temperature: temperature (°C) - from API
                - rainfall: rainfall (mm) - from API
                - hour_of_week: hour of week (0-167)
                - isWeekend: is weekend (0 or 1)
                - month: month (1-12)
                - prediction_minutes: prediction minutes (0-60)
                - longitude: station longitude (constant)
                - latitude: station latitude (constant)
        
        return format:
            dict: {
                'arrivals': bike arrivals array,
                'departures': bike departures array
            }
        """
        if isinstance(data, dict):
            data = pd.DataFrame([data])
        
        arrivals = []
        departures = []
        
        for idx, row in data.iterrows():
            # extract features
            temperature = row.get('temperature', 20)
            rainfall = row.get('rainfall', 0)
            hour_of_week = row.get('hour_of_week', 0)
            is_weekend = row.get('isWeekend', 0)
            month = row.get('month', 6)
            prediction_minutes = row.get('prediction_minutes', 0)  # prediction minutes (0-60)
            longitude = row.get('longitude', -71.0589)
            latitude = row.get('latitude', 42.3601)
            
            # calculate scores for each factor
            
            # 1. temperature factor (10-30°C most comfortable, highest score)
            if 15 <= temperature <= 25:
                temp_score = 1.0
            elif temperature < 15:
                temp_score = max(0, (temperature + 5) / 20)
            else:
                temp_score = max(0, 1 - (temperature - 25) / 15)
            
            # 2. rainfall factor (more rainfall, lower demand)
            rain_score = max(0, 1 - rainfall / 10)
            
            # 3. hour factor (simulate peak hours of the day)
            hour_of_day = hour_of_week % 24
            
            # rush hour: 7-9am and 5-7pm
            if 7 <= hour_of_day <= 9 or 17 <= hour_of_day <= 19:
                hour_score = 2.5  # peak hour (大幅增加）
            elif 10 <= hour_of_day <= 16:
                hour_score = 1.8  # normal hour (增加）
            elif 20 <= hour_of_day <= 22:
                hour_score = 1.2  # night (增加）
            else:
                hour_score = 0.6  # late night/early morning (增加）
            
            # 4. weekend factor
            if is_weekend:
                weekend_score = 0.85  # weekend demand略低于工作日
                # weekend peak hour adjustment
                if 10 <= hour_of_day <= 18:
                    hour_score = 2.0  # weekend daytime activity (增加）
            else:
                weekend_score = 1.0
            
            # 5. month factor (seasonal, spring/summer demand high)
            month_scores = {
                1: 0.6,  2: 0.65, 3: 0.8,   # winter/spring
                4: 0.95, 5: 1.1,  6: 1.2,   # summer/spring
                7: 1.2,  8: 1.15, 9: 1.1,   # summer/fall
                10: 0.9, 11: 0.7, 12: 0.6   # fall/winter
            }
            month_score = month_scores.get(month, 1.0)
            
            # 6. location factor (station location constant)
            # Boston downtown: lat ≈ 42.36, lon ≈ -71.06
            distance_from_center = np.sqrt(
                (latitude - 42.36)**2 + (longitude + 71.06)**2
            )
            # closer to downtown, higher demand
            location_score = max(0.5, 1 - distance_from_center * 20)
            
            # calculate base activity
            base_activity = self.base_activity * (
                1 +
                self.weights['temperature'] * temp_score +
                self.weights['rainfall'] * rain_score +
                self.weights['hour_factor'] * hour_score +
                self.weights['weekend_factor'] * weekend_score +
                self.weights['month_factor'] * month_score
            ) * location_score
            
            # calculate in/out ratio (based on time and location)
            # check if in downtown area (closer to downtown)
            is_downtown = distance_from_center < 0.05
            
            # rush hour (7-9am)
            if 7 <= hour_of_day <= 9:
                if is_downtown:
                    # downtown: more bikes arriving (上班）- 差值更大
                    arrival_ratio = 0.80
                    departure_ratio = 0.20
                else:
                    # residential area: more bikes leaving (去上班）- 差值更大
                    arrival_ratio = 0.20
                    departure_ratio = 0.80
            # late rush hour (17-19pm)
            elif 17 <= hour_of_day <= 19:
                if is_downtown:
                    # downtown: more bikes leaving (下班）- 差值更大
                    arrival_ratio = 0.20
                    departure_ratio = 0.80
                else:
                    # residential area: more bikes arriving (下班回家）- 差值更大
                    arrival_ratio = 0.80
                    departure_ratio = 0.20
            # lunch hour (11-14pm)
            elif 11 <= hour_of_day <= 14:
                # lunch time, slightly unbalanced
                arrival_ratio = 0.60
                departure_ratio = 0.40
            # other hours
            else:
                # some fluctuation
                arrival_ratio = 0.40
                departure_ratio = 0.60
            
            # weekend adjustment: weekend in/out has difference
            if is_weekend:
                arrival_ratio = 0.55 + np.random.uniform(-0.10, 0.10)
                departure_ratio = 1 - arrival_ratio
            
            # calculate arrivals and departures
            arrival_count = base_activity * arrival_ratio
            departure_count = base_activity * departure_ratio
            
            # time prediction factor (0-60 minutes)
            # prediction time further, uncertainty increases, considering time accumulation of demand
            # convert minutes to hours ratio for calculation
            time_ratio = prediction_minutes / 60.0  # 0 to 1
            
            # adjust prediction value based on prediction time
            # short term prediction (0-30 minutes): linear growth
            # long term prediction (30-60 minutes): slow growth
            if prediction_minutes <= 30:
                time_factor = 0.5 + (time_ratio * 1.0)  # 0.5 to 1.0
            else:
                time_factor = 1.0 + ((time_ratio - 0.5) * 0.4)  # 1.0 to 1.2
            
            arrival_count = arrival_count * time_factor
            departure_count = departure_count * time_factor
            
            # add random noise, prediction time further, noise increases
            noise_scale = 2.0 + (prediction_minutes / 60.0) * 2.0  # 2.0 to 4.0 (increase noise amplitude)
            arrival_noise = np.random.normal(0, noise_scale)
            departure_noise = np.random.normal(0, noise_scale)
            
            arrival_count = max(0, arrival_count + arrival_noise)
            departure_count = max(0, departure_count + departure_noise)
            
            # round to nearest integer (bike count)
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
        convenient method for single station prediction
        
        parameters:
            temperature: temperature (from API)
            rainfall: rainfall (from API)
            hour_of_week: hour of week
            isWeekend: is weekend
            month: month
            prediction_minutes: prediction minutes (0-60)
            longitude: station longitude (constant)
            latitude: station latitude (constant)
        
        return format:
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


# create global model instance
model = BikeShareSimulator()

