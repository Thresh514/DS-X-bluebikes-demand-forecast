from joblib import load
import pandas as pd

# load model
model = load('bike_multi_xgb_model.joblib')

# prepare input data
# X_input = pd.DataFrame([{
#     "station_id": 325,
#     "date_only":
#     "hr": 30,
#     "dow": 3,
#     "month": 7,
#     "hour_of_week": 30,
#     "weekend": 0,
#     "weekhour": 30,
#     "num_bikes_in": 2,
#     "num_bikes_out": 5,
#     "TMAX": 20,
#     "TMIN": 10,
#     "PRCP": 0.23,
#     "SNOW": 2,
# }])

# predict
y_pred = model.predict(X_input)
print("prediction results:", y_pred)
