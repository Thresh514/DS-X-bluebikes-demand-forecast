"""
Simple bike demand predictor based on common sense rules
基于常识规律的简单自行车需求预测器
"""
import numpy as np
import pandas as pd

class SimpleBikePredictor:
    """
    Simple predictor based on common sense patterns:
    - Rush hours: higher demand
    - Weekdays vs weekends: different patterns
    - Seasons: summer > spring/fall > winter
    - Location: downtown > suburbs
    """

    def __init__(self):
        np.random.seed(42)

    def predict(self, data):
        """
        Predict bike arrivals and departures

        Expected input (backend format):
        - hour_of_day: 0-23
        - day_of_week: 0-6 (0=Monday)
        - month: 1-12
        - is_weekend: 0 or 1
        - station_lat: latitude
        - station_lng: longitude
        - dist_subway_m: distance to subway
        - dist_bus_m: distance to bus
        - dist_university_m: distance to university
        - dist_business: distance to business district
        - dist_residential: distance to residential
        - restaurant_count: number of nearby restaurants

        Returns:
        {
            'arrivals': array of predicted arrivals,
            'departures': array of predicted departures
        }
        """
        if isinstance(data, dict):
            data = pd.DataFrame([data])
        elif isinstance(data, list):
            data = pd.DataFrame(data)

        arrivals = []
        departures = []

        for idx, row in data.iterrows():
            # Extract features
            hour = int(row.get('hour_of_day', 12))
            day = int(row.get('day_of_week', 0))
            month = int(row.get('month', 6))
            is_weekend = int(row.get('is_weekend', 0))
            lat = float(row.get('station_lat', 42.36))
            lng = float(row.get('station_lng', -71.06))
            dist_university = float(row.get('dist_university_m', 500))
            dist_business = float(row.get('dist_business', 500))


            if not is_weekend:  # 工作日
                if 7 <= hour <= 9:  # 早高峰
                    base_demand = np.random.randint(20, 35)
                elif 17 <= hour <= 19:  # 晚高峰
                    base_demand = np.random.randint(20, 35)
                elif 10 <= hour <= 16:  # 白天
                    base_demand = np.random.randint(10, 20)
                elif 20 <= hour <= 23:  # 晚上
                    base_demand = np.random.randint(5, 12)
                else:  # 深夜/凌晨 (0-6)
                    base_demand = np.random.randint(0, 5)
            else:  # 周末
                if 10 <= hour <= 18:  # 周末白天
                    base_demand = np.random.randint(15, 25)
                elif 19 <= hour <= 23:  # 周末晚上
                    base_demand = np.random.randint(8, 15)
                else:  # 周末深夜/早晨
                    base_demand = np.random.randint(0, 8)

            if month in [6, 7, 8]:  # 夏季
                season_multiplier = 1.2
            elif month in [3, 4, 5, 9, 10]:  # 春秋
                season_multiplier = 1.0
            elif month in [11, 12, 1, 2]:  # 冬季
                season_multiplier = 0.7
            else:
                season_multiplier = 1.0

            distance_from_center = np.sqrt(
                (lat - 42.36)**2 + (lng + 71.06)**2
            )

            # 靠近市中心 = 高活跃度
            if distance_from_center < 0.02:  # 非常近
                location_multiplier = 1.3
            elif distance_from_center < 0.05:  # 比较近
                location_multiplier = 1.1
            else:  # 远
                location_multiplier = 0.9

            # 靠近大学 = 高活跃度
            if dist_university < 200:
                location_multiplier *= 1.2

            # 靠近商业区 = 高活跃度
            if dist_business < 300:
                location_multiplier *= 1.15

            total_demand = base_demand * season_multiplier * location_multiplier

            is_downtown = distance_from_center < 0.05

            if not is_weekend:
                if 7 <= hour <= 9:
                    if is_downtown:
                        arrival_ratio = 0.70
                    else:
                        arrival_ratio = 0.30
                elif 17 <= hour <= 19:
                    if is_downtown:
                        arrival_ratio = 0.30
                    else:
                        arrival_ratio = 0.70
                elif 12 <= hour <= 14:
                    arrival_ratio = 0.55
                else:
                    arrival_ratio = 0.50
            else:
                arrival_ratio = 0.50 + np.random.uniform(-0.15, 0.15)

            arrival_count = int(total_demand * arrival_ratio)
            departure_count = int(total_demand * (1 - arrival_ratio))

            arrival_count += np.random.randint(-3, 4)
            departure_count += np.random.randint(-3, 4)

            arrival_count = max(0, arrival_count)
            departure_count = max(0, departure_count)

            arrival_count = min(50, arrival_count)
            departure_count = min(50, departure_count)

            arrivals.append(arrival_count)
            departures.append(departure_count)

        return {
            'arrivals': np.array(arrivals),
            'departures': np.array(departures)
        }


if __name__ == "__main__":
    print("Testing SimpleBikePredictor...")
    print("=" * 60)

    predictor = SimpleBikePredictor()

    print("\nTest 1: Workday morning rush hour (8 AM), Downtown")
    test1 = {
        'hour_of_day': 8,
        'day_of_week': 2,
        'month': 6,
        'is_weekend': 0,
        'station_lat': 42.36,
        'station_lng': -71.06,
        'dist_subway_m': 100,
        'dist_bus_m': 50,
        'dist_university_m': 500,
        'dist_business': 200,
        'dist_residential': 400,
        'restaurant_count': 20
    }
    result1 = predictor.predict(test1)
    print(f"  Arrivals: {result1['arrivals'][0]}")
    print(f"  Departures: {result1['departures'][0]}")
    print(f"  Pattern: Downtown morning rush hour, Arrivals > Departures (上班)")

    print("\nTest 2: Workday evening rush hour (6 PM), Residential Area")
    test2 = {
        'hour_of_day': 18,
        'day_of_week': 3,
        'month': 9,
        'is_weekend': 0,
        'station_lat': 42.40,
        'station_lng': -71.10,
        'dist_subway_m': 300,
        'dist_bus_m': 100,
        'dist_university_m': 1000,
        'dist_business': 800,
        'dist_residential': 200,
        'restaurant_count': 10
    }
    result2 = predictor.predict(test2)
    print(f"  Arrivals: {result2['arrivals'][0]}")
    print(f"  Departures: {result2['departures'][0]}")
    print(f"  Pattern: Residential area evening rush hour, Arrivals > Departures (下班回家)")

    print("\nTest 3: Weekend daytime (2 PM), University Area")
    test3 = {
        'hour_of_day': 14,
        'day_of_week': 6,
        'month': 5,
        'is_weekend': 1,
        'station_lat': 42.36,
        'station_lng': -71.09,
        'dist_subway_m': 200,
        'dist_bus_m': 50,
        'dist_university_m': 100,
        'dist_business': 400,
        'dist_residential': 300,
        'restaurant_count': 15
    }
    result3 = predictor.predict(test3)
    print(f"  Arrivals: {result3['arrivals'][0]}")
    print(f"  Departures: {result3['departures'][0]}")
    print(f"  Pattern: Weekend daytime, Arrivals and departures are balanced")

    print("\nTest 4: Overnight (2 AM)")
    test4 = {
        'hour_of_day': 2,
        'day_of_week': 5,
        'month': 7,
        'is_weekend': 1,
        'station_lat': 42.35,
        'station_lng': -71.05,
        'dist_subway_m': 150,
        'dist_bus_m': 80,
        'dist_university_m': 600,
        'dist_business': 300,
        'dist_residential': 250,
        'restaurant_count': 25
    }
    result4 = predictor.predict(test4)
    print(f"  Arrivals: {result4['arrivals'][0]}")
    print(f"  Departures: {result4['departures'][0]}")
    print(f"  Pattern: Overnight, demand is very low")

    print("\nTest 5: Season comparison (both workday afternoon 3 PM)")
    test_winter = dict(test1)
    test_winter['hour_of_day'] = 15
    test_winter['month'] = 1

    test_summer = dict(test1)
    test_summer['hour_of_day'] = 15
    test_summer['month'] = 7

    result_winter = predictor.predict(test_winter)
    result_summer = predictor.predict(test_summer)

    print(f"  Winter (January): Arrivals={result_winter['arrivals'][0]}, Departures={result_winter['departures'][0]}")
    print(f"  Summer (July): Arrivals={result_summer['arrivals'][0]}, Departures={result_summer['departures'][0]}")
    print(f"  Pattern: Summer demand > Winter demand")

    print("\n" + "=" * 60)
    print("✓ All tests completed!")
