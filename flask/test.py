from joblib import load
import pandas as pd
import numpy as np

class RealModelWrapper:
    """
    wrapper class for real trained model, for Flask API
    """
    
    def __init__(self, model_path='bike_multi_xgb_model.joblib'):
        # load real trained model
        print(f"📦 loading model: {model_path}")
        self.model = load(model_path)
        print(f"✅ model loaded successfully!")
    
    def predict(self, data):
        """
        predict bike in/out volume (adapt new schema)

        parameters:
            data: DataFrame or dict, supports the following new fields (at least one of them is required, others will be ignored):
                - station_id: station ID
                - station_name: station name
                - hour_start: start hour timestamp (optional)
                - hour_end: end hour timestamp (optional)
                - num_bikes_out / num_bikes_in: historical in/out volume of the hour (optional, for debugging)
                - postalcode / Date / date_only: date information (optional)
                - TMAX / TMIN: temperature (optional, for logging)
                - PRCP / SNOW: precipitation/snow (inches, optional, for logging)
                - dow: day of week (Sunday is 0)
                - hr: hour (0-23)
                - month: month (1-12)
                - weekend: is weekend (0/1). if not provided, will be inferred from dow
                - weekhour: hour of week (0-167). if provided, will be used to construct model features
                - latitude/longitude: station coordinates (optional)
        return format:
            dict: {
                'arrivals': arrivals array,
                'departures': departures array
            }
        """
        print("\n" + "="*50)
        print("🚴 starting prediction...")
        
        if isinstance(data, dict):
            data = pd.DataFrame([data])
        
        print(f"📊 number of input data rows: {len(data)}")
        
        # map API input parameters to model features
        X_input = pd.DataFrame()
        
        for idx, row in data.iterrows():
            # read and display key information (new schema)
            station_id = row.get('station_id', 325)
            station_name = row.get('station_name', 'Unknown')
            weekhour = row.get('weekhour')
            dow = row.get('dow')
            hr = row.get('hr')
            month = row.get('month') if pd.notna(row.get('month')) else None
            weekend = row.get('weekend')

            # infer month (if not provided, can be inferred from date field; here simplified to default June)
            if month is None:
                month = 6

            # infer weekhour (use provided weekhour first, then infer from dow+hr)
            if pd.isna(weekhour) or weekhour is None:
                if pd.notna(dow) and pd.notna(hr):
                    try:
                        weekhour = int(dow) * 24 + int(hr)
                    except Exception:
                        weekhour = 0
                else:
                    weekhour = 0

            # when only weekhour is provided, infer dow and hr
            if (pd.isna(dow) or dow is None) or (pd.isna(hr) or hr is None):
                if pd.notna(weekhour) and weekhour is not None:
                    try:
                        weekhour_int = int(weekhour)
                        dow = weekhour_int // 24
                        hr = weekhour_int % 24
                        # normalize range
                        dow = int(dow) % 7
                        hr = int(hr) % 24
                    except Exception:
                        dow = 0
                        hr = 0
                else:
                    dow = 0
                    hr = 0

            # infer is_weekend (need to determine dow first)
            if pd.isna(weekend) or weekend is None:
                try:
                    weekend = 1 if int(dow) in (0, 6) else 0
                except Exception:
                    weekend = 0

            # display environment information (temperature and precipitation only for logging)
            tmax = row.get('TMAX')
            tmin = row.get('TMIN')
            prcp_inch = row.get('PRCP', 0)
            snow_inch = row.get('SNOW', 0)

            # numerical safety handling, avoid float(None) etc. errors
            tmax = np.nan if pd.isna(tmax) else tmax
            tmin = np.nan if pd.isna(tmin) else tmin
            prcp_inch = 0 if pd.isna(prcp_inch) else prcp_inch
            snow_inch = 0 if pd.isna(snow_inch) else snow_inch

            # readable temperature display: if TMAX/TMIN both exist, display range; otherwise display single value
            temp_desc = "--"
            if pd.notna(tmax) and pd.notna(tmin):
                temp_desc = f"{tmin}°F ~ {tmax}°F"
            elif pd.notna(tmax):
                temp_desc = f"{tmax}°F"
            elif pd.notna(tmin):
                temp_desc = f"{tmin}°F"

            print(f"\n📍 station #{idx + 1}:(ID: {station_id})")
            print(f"   🌡️  temperature(F): {temp_desc}")
            print(f"   🌧️  precipitation/snow(inches): PRCP={prcp_inch}, SNOW={snow_inch}")
            print(f"   ⏰ 一周小时 weekhour: {weekhour}")
            print(f"   🗓️  day of week/hour: dow={int(dow)}, hr={int(hr)}")
            print(f"   📅 is weekend: {'yes' if int(weekend) == 1 else 'no'}")
            print(f"   📆 month: {month}")

            # build model input features: keep consistent with trained model
            features = {
                "start_hour_of_week": float(weekhour),
                "end_hour_of_week": float(weekhour) + 1.0,
                "is_weekend": int(weekend),
                "month": int(month),
                "station_id": int(station_id),
                "num_bikes_in": int(row.get('num_bikes_in', 0)),
                "num_bikes_out": int(row.get('num_bikes_out', 0)),
                "TMAX": float(tmax),
                "TMIN": float(tmin),
                "PRCP": float(prcp_inch),
                "SNOW": float(snow_inch),
                "dow": int(dow),
                "hr": int(hr),
                "weekend": int(weekend),
                "weekhour": float(weekhour),
            }

            X_input = pd.concat([X_input, pd.DataFrame([features])], ignore_index=True)
        
        # use real model to predict
        print(f"\n🔮 using real model to predict...")
        predictions = self.model.predict(X_input)
        
        # parse prediction results
        # assume model returns [arrivals, departures] or single value
        arrivals = []
        departures = []
        
        print(f"\n✨ prediction results:")
        for i, pred in enumerate(predictions):
            # if single value, assume arrivals = departures = pred/2
            if isinstance(pred, (int, float, np.integer, np.floating)):
                arrival = int(pred * 0.5)
                departure = int(pred * 0.5)
            else:
                # if array, take first two values
                arrival = int(pred[0]) if len(pred) > 0 else 0
                departure = int(pred[1]) if len(pred) > 1 else 0
            
            arrivals.append(arrival)
            departures.append(departure)
            
            print(f"station #{i + 1}: arrivals ⬇️  {arrival} | departures ⬆️  {departure}")
        
        print("="*50 + "\n")
        
        return {
            'arrivals': np.array(arrivals),
            'departures': np.array(departures)
        }


# create global model instance for app.py
model = RealModelWrapper()


# test code (only execute when running this file directly)
if __name__ == "__main__":
    # prepare test input data
    test_data = {
        # station information
        "station_id": 1,
        "station_name": "18 Dorrance Warehouse",

        # hour interval (optional, for logging)
        "hour_start": "02may2022 22:00:00",
        "hour_end": "02may2022 22:59:59",

        # historical in/out volume of the hour (optional, for debugging)
        "num_bikes_out": 0,
        "num_bikes_in": 1,

        # geographic/postal code (optional)
        # "postalcode": "01571",

        # date and weather (F/inches, only for logging)
        "Date": "02may2022",
        "date_only": "02may2022",
        "TMAX": 56,
        "TMIN": 45,
        "PRCP": 0.19,
        "SNOW": 0,

        # time derived features
        "dow": 1,            # Monday
        "hr": 22,            # current 22:00
        "month": 5,
        "weekend": 0,
        "weekhour": 46,      # calculated from dow/hr also 46

        # optional station coordinates (if not provided, use default values)
        # "latitude": 42.35,
        # "longitude": -71.08,
    }
    
    # predict
    result = model.predict(test_data)
    print("prediction results:")
    print(f"  arrivals: {result['arrivals']}")
    print(f"  departures: {result['departures']}")
