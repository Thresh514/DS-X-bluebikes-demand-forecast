import pandas as pd
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.multioutput import MultiOutputRegressor
import joblib
import os
import numpy as np

# 1. Check if feature file exists
feature_files = [
    "src/data/2023.csv",
    # can add more files here
]
missing_files = [f for f in feature_files if not os.path.exists(f)]
if missing_files:
    print(f"❌ Missing feature files: {missing_files}")
    exit(1)

df_list = [pd.read_csv(f) for f in feature_files]
df = pd.concat(df_list, ignore_index=True)
df.columns = df.columns.str.strip()

df = df.dropna(subset=[
    'stationid', 'stationname', 'hr', 'month', 'dow', 'weekend', 'weekhour',
    'num_bikes_in', 'num_bikes_out', 'TMAX', 'TMIN', 'PRCP', 'SNOW',
    'next_bike_in', 'next_bike_out'
])

# 3. Normalize weather features
weather_cols = ['TMAX', 'TMIN', 'PRCP', 'SNOW']
scaler = MinMaxScaler()
df[weather_cols] = scaler.fit_transform(df[weather_cols])

# time cyclical features    
df['hr_sin'] = np.sin(2 * np.pi * df['hr'] / 24)
df['hr_cos'] = np.cos(2 * np.pi * df['hr'] / 24)

# 4. Prepare features and targetw
feature_columns = [
    'stationid', 
    'hr', 'month', 'dow', 'weekend', 'weekhour',
    'num_bikes_in', 'num_bikes_out',
    'TMAX', 'TMIN', 'PRCP', 'SNOW'
]
X = df[feature_columns].copy()
y_multi = df[['next_bike_in', 'next_bike_out']]

# 5. Split train/test
X_train, X_test, y_train, y_test = train_test_split(X, y_multi, test_size=0.2, random_state=42)

# 6. use fixed params
best_params = {'learning_rate': 0.1, 'max_depth': 10, 'n_estimators': 500}
print("Using fixed parameters for IN/OUT:", best_params)

# 7. Train MultiOutput XGBoost model
base_model = xgb.XGBRegressor(**best_params, random_state=42)
multi_model = MultiOutputRegressor(base_model)
multi_model.fit(X_train, y_train)
print("✅ Multi-output model training completed!")

# 8. Evaluate
y_pred = multi_model.predict(X_test)
mae_in = mean_absolute_error(y_test['next_bike_in'], y_pred[:, 0])
rmse_in = np.sqrt(mean_squared_error(y_test['next_bike_in'], y_pred[:, 0]))
mae_out = mean_absolute_error(y_test['next_bike_out'], y_pred[:, 1])
rmse_out = np.sqrt(mean_squared_error(y_test['next_bike_out'], y_pred[:, 1]))

print("-" * 60)
print("📊 IN MODEL PERFORMANCE:")
print(f"   • MAE: {mae_in:.2f} bikes")
print(f"   • RMSE: {rmse_in:.2f} bikes")
print("📊 OUT MODEL PERFORMANCE:")
print(f"   • MAE: {mae_out:.2f} bikes")
print(f"   • RMSE: {rmse_out:.2f} bikes")
print("-" * 60)

# 9. Feature importance
fi_in = pd.DataFrame({
    'feature': feature_columns,
    'importance': multi_model.estimators_[0].feature_importances_
}).sort_values('importance', ascending=False)
fi_out = pd.DataFrame({
    'feature': feature_columns,
    'importance': multi_model.estimators_[1].feature_importances_
}).sort_values('importance', ascending=False)
print("🔍 IN FEATURE IMPORTANCE:")
print(fi_in)
print("🔍 OUT FEATURE IMPORTANCE:")
print(fi_out)

high_flow_mask = y_test['next_bike_in'] > 5
high_flow_actual = y_test['next_bike_in'][high_flow_mask]
high_flow_pred = y_pred[high_flow_mask, 0]
print("\n🚲 High-flow IN samples (actual > 5):")
print(pd.DataFrame({
    'Actual': high_flow_actual.values[:10],
    'Predicted': high_flow_pred[:10].round(1),
    'Diff': (high_flow_pred[:10] - high_flow_actual.values[:10]).round(1)
}).to_string(index=False))
print("High-flow IN MAE:", mean_absolute_error(high_flow_actual, high_flow_pred))
print("High-flow IN RMSE:", np.sqrt(mean_squared_error(high_flow_actual, high_flow_pred)))

# 10. Save models
joblib.dump(multi_model, "bike_multi_xgb_model.joblib")
joblib.dump(feature_columns, "feature_columns.joblib")
print("💾 Multi-output model and feature columns saved.")

print(df['next_bike_in'].value_counts().sort_index())
print(df[df['next_bike_in'] > 10][feature_columns].describe())

# 11. Sample predictions
print("\n🎯 Sample predictions vs actual (IN):")
sample_size = min(10, len(y_test))
sample_df_in = pd.DataFrame({
    'Actual': y_test.iloc[:sample_size, 0].values,
    'Predicted': y_pred[:sample_size, 0].round(1),
    'Diff': (y_pred[:sample_size, 0] - y_test.iloc[:sample_size, 0].values).round(1)
})
print(sample_df_in.to_string(index=False))

print("\n🎯 Sample predictions vs actual (OUT):")
sample_df_out = pd.DataFrame({
    'Actual': y_test.iloc[:sample_size, 1].values,
    'Predicted': y_pred[:sample_size, 1].round(1),
    'Diff': (y_pred[:sample_size, 1] - y_test.iloc[:sample_size, 1].values).round(1)
})
print(sample_df_out.to_string(index=False))