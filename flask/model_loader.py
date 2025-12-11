"""
Real model loader for Negative Binomial model
"""
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
import statsmodels.api as sm

class NBModelPredictor:
    """
    Wrapper for the trained Negative Binomial model
    """
    def __init__(self, model_path='nb_in_model.pkl'):
        """
        Load the trained model from pickle file

        Args:
            model_path: Path to the .pkl model file
        """
        self.model_path = Path(model_path)
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")

        print(f"Loading model from {self.model_path}...")
        with open(self.model_path, 'rb') as f:
            model_dict = pickle.load(f)

        # Extract components from the dictionary
        if isinstance(model_dict, dict):
            self.imputer = model_dict.get('imputer')
            self.model = model_dict.get('model')
            self.alpha = model_dict.get('alpha')
            self.feature_names = model_dict.get('feature_names')

            print(f"✓ Model loaded successfully!")
            print(f"  - Imputer: {type(self.imputer).__name__}")
            print(f"  - Model: {type(self.model).__name__}")
            print(f"  - Alpha: {self.alpha}")
            print(f"  - Features: {len(self.feature_names) if self.feature_names else 'unknown'}")
        else:
            # If it's not a dict, assume it's the model directly
            self.model = model_dict
            self.imputer = None
            self.alpha = None
            self.feature_names = None
            print("Warning: Model is not in expected dictionary format")

        # Define the expected feature columns in correct order
        # Use feature_names from model if available, otherwise use default
        if self.feature_names:
            self.feature_columns = self.feature_names
        else:
            self.feature_columns = [
                'hour_of_day',
                'day_of_week',
                'month',
                'is_weekend',
                'station_lat',
                'station_lng',
                'dist_subway_m',
                'dist_bus_m',
                'dist_university_m',
                'dist_business',
                'dist_residential',
                'restaurant_count'
            ]

        print(f"  - Feature columns: {self.feature_columns}")

    def predict(self, input_data):
        """
        Make predictions using the loaded model

        Args:
            input_data: DataFrame or dict with required features

        Returns:
            dict with 'arrivals' and 'departures' predictions
        """
        # Convert input to DataFrame if it's a dict
        if isinstance(input_data, dict):
            df = pd.DataFrame([input_data])
        elif isinstance(input_data, list):
            df = pd.DataFrame(input_data)
        else:
            df = input_data.copy()

        # Validate that all required features are present
        missing_features = set(self.feature_columns) - set(df.columns)
        if missing_features:
            raise ValueError(f"Missing required features: {missing_features}")

        # Select and order features correctly
        X = df[self.feature_columns].values  # Convert to numpy array

        # Apply imputation if imputer exists
        # This follows the exact same preprocessing as during training
        if self.imputer is not None:
            X_imputed = self.imputer.transform(X)
        else:
            X_imputed = X

        # Add constant term for statsmodels
        # During training: X_train_sm = sm.add_constant(X_train_imp)
        X_with_const = sm.add_constant(X_imputed, has_constant='add')

        # Make prediction
        try:
            predictions = self.model.predict(X_with_const)

            # Convert to numpy array if it's a pandas Series
            if hasattr(predictions, 'values'):
                predictions = predictions.values

            # Clip predictions to reasonable range before rounding
            # Bike counts should be between 0 and 100 typically
            predictions = np.clip(predictions, 0, 100)

            # Round to integers (bike counts should be whole numbers)
            predictions = np.round(predictions).astype(int)

            # Ensure non-negative predictions
            predictions = np.maximum(predictions, 0)

        except Exception as e:
            print(f"Error during prediction: {e}")
            print(f"Input shape: {X_with_const.shape}")
            print(f"Input sample: {X_with_const[0]}")
            raise

        # Return in the expected format
        # Note: This model only predicts arrivals (IN)
        # For departures, you would need a separate model (nb_out_model.pkl)
        return {
            'arrivals': predictions.tolist(),
            'departures': predictions.tolist()  # Using same for now, replace with OUT model
        }

    def predict_single(self, hour_of_day, day_of_week, month, is_weekend,
                      station_lat, station_lng, dist_subway_m, dist_bus_m,
                      dist_university_m, dist_business, dist_residential,
                      restaurant_count):
        """
        Convenience method for single prediction

        Args:
            All feature values as individual parameters

        Returns:
            dict with single 'arrivals' and 'departures' values
        """
        input_dict = {
            'hour_of_day': hour_of_day,
            'day_of_week': day_of_week,
            'month': month,
            'is_weekend': is_weekend,
            'station_lat': station_lat,
            'station_lng': station_lng,
            'dist_subway_m': dist_subway_m,
            'dist_bus_m': dist_bus_m,
            'dist_university_m': dist_university_m,
            'dist_business': dist_business,
            'dist_residential': dist_residential,
            'restaurant_count': restaurant_count
        }

        result = self.predict(input_dict)

        return {
            'arrivals': result['arrivals'][0],
            'departures': result['departures'][0]
        }


if __name__ == "__main__":
    # Test the model loader
    print("Testing NBModelPredictor...")
    print("="*60)

    try:
        predictor = NBModelPredictor('nb_in_model.pkl')

        print("\n" + "="*60)
        print("Test 1: Evening rush hour at MIT")
        print("="*60)
        # Test with sample data - typical values for MIT area during evening rush
        test_data = {
            'hour_of_day': 17,        # 5 PM
            'day_of_week': 2,         # Wednesday (0=Monday)
            'month': 6,               # June
            'is_weekend': 0,          # Weekday
            'station_lat': 42.3601,   # MIT area
            'station_lng': -71.0942,
            'dist_subway_m': 200.0,   # 200m to subway
            'dist_bus_m': 50.0,       # 50m to bus
            'dist_university_m': 100.0, # 100m to university
            'dist_business': 500.0,   # 500m to business district
            'dist_residential': 300.0, # 300m to residential
            'restaurant_count': 15    # 15 nearby restaurants
        }

        result = predictor.predict(test_data)
        print(f"Arrivals: {result['arrivals'][0]}")
        print(f"Departures: {result['departures'][0]}")

        print("\n" + "="*60)
        print("Test 2: Morning at Harvard Square")
        print("="*60)
        test_data2 = {
            'hour_of_day': 8,
            'day_of_week': 1,
            'month': 9,
            'is_weekend': 0,
            'station_lat': 42.3736,
            'station_lng': -71.1190,
            'dist_subway_m': 100.0,
            'dist_bus_m': 30.0,
            'dist_university_m': 50.0,
            'dist_business': 200.0,
            'dist_residential': 400.0,
            'restaurant_count': 25
        }

        result2 = predictor.predict(test_data2)
        print(f"Arrivals: {result2['arrivals'][0]}")
        print(f"Departures: {result2['departures'][0]}")

        print("\n" + "="*60)
        print("✓ All tests successful!")
        print("="*60)

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
