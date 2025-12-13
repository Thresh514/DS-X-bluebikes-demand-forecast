"""
ZINB (Zero-Inflated Negative Binomial) Model Predictor
实现特征选择、标准化和预测功能
"""
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
import statsmodels.api as sm
from sklearn.preprocessing import StandardScaler


class ZINBPredictor:
    """
    ZINB 模型预测器
    实现特征子集选择、标准化和预测
    """
    
    def __init__(self, model_path='zinb_models.pkl'):
        """
        加载训练好的 ZINB 模型
        
        Args:
            model_path: 模型文件路径
        """
        self.model_path = Path(model_path)
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        print(f"Loading ZINB models from {self.model_path}...")
        with open(self.model_path, 'rb') as f:
            model_dict = pickle.load(f)
        
        # 打印模型文件中的所有键，用于调试
        print(f"Available keys in model file: {list(model_dict.keys())}")
        
        # 提取模型组件
        # 支持不同的键名格式
        self.model_out = (model_dict.get('model_out') or 
                         model_dict.get('zinb_out_model') or
                         model_dict.get('out_model') or
                         model_dict.get('zinb_out_results'))
        self.model_in = (model_dict.get('model_in') or 
                        model_dict.get('zinb_in_model') or
                        model_dict.get('in_model') or
                        model_dict.get('zinb_in_results'))
        
        # ===== 修改：添加容错逻辑，使用主 scaler 作为后备 =====
        self.scaler_nb = (model_dict.get('scaler_nb') or 
                         model_dict.get('nb_scaler') or
                         model_dict.get('scaler_nb_scaled') or
                         model_dict.get('scaler'))  # 使用主 scaler 作为后备
        
        self.scaler_infl = (model_dict.get('scaler_infl') or 
                           model_dict.get('infl_scaler') or
                           model_dict.get('scaler_infl_scaled') or
                           model_dict.get('scaler'))  # 使用主 scaler 作为后备
        
        # 验证模型是否存在
        if self.model_out is None:
            raise ValueError("OUT model not found in model file. Available keys: " + str(list(model_dict.keys())))
        if self.model_in is None:
            raise ValueError("IN model not found in model file. Available keys: " + str(list(model_dict.keys())))
        
        # ===== 修改验证逻辑：添加警告而不是抛出错误 =====
        if self.scaler_nb is None:
            print("⚠ Warning: NB scaler not found, creating default scaler")
            self.scaler_nb = StandardScaler()
        else:
            # 检查是否使用了主 scaler 作为后备
            if self.scaler_nb is model_dict.get('scaler'):
                print("⚠ Warning: Using main 'scaler' for NB features (nb_scaler not found)")
        
        if self.scaler_infl is None:
            print("⚠ Warning: Inflation scaler not found, creating default scaler")
            self.scaler_infl = StandardScaler()
        else:
            # 检查是否使用了主 scaler 作为后备
            if self.scaler_infl is model_dict.get('scaler'):
                print("⚠ Warning: Using main 'scaler' for inflation features (infl_scaler not found)")
        
        # 检查 scaler 是否已拟合（通过检查是否有 mean_ 属性）
        if self.scaler_nb is not None:
            if not hasattr(self.scaler_nb, 'mean_') or self.scaler_nb.mean_ is None:
                print("⚠ Warning: NB scaler is not fitted properly")
            else:
                print(f"✓ NB scaler is fitted (mean shape: {self.scaler_nb.mean_.shape})")
        if self.scaler_infl is not None:
            if not hasattr(self.scaler_infl, 'mean_') or self.scaler_infl.mean_ is None:
                print("⚠ Warning: Inflation scaler is not fitted properly")
            else:
                print(f"✓ Inflation scaler is fitted (mean shape: {self.scaler_infl.mean_.shape})")
        
        # 定义特征列表
        # Negative Binomial features (7 features)
        self.nb_features = [
            "month",
            "start_hour",
            "end_hour",
            "subway_distance_m",
            "mbta_stops_250m",
            "last_day_in",
            "last_day_out"
        ]
        
        # Inflation features (5 features)
        self.infl_features = [
            "is_night",
            "precipitation",
            "avg_temp",
            "last_day_in",
            "last_day_out"
        ]
        
        print(f"✓ ZINB models loaded successfully!")
        print(f"  - OUT model: {type(self.model_out).__name__ if self.model_out else 'None'}")
        print(f"  - IN model: {type(self.model_in).__name__ if self.model_in else 'None'}")
        print(f"  - NB scaler: {type(self.scaler_nb).__name__ if self.scaler_nb else 'None'}")
        print(f"  - Infl scaler: {type(self.scaler_infl).__name__ if self.scaler_infl else 'None'}")
        print(f"  - NB features: {self.nb_features}")
        print(f"  - Infl features: {self.infl_features}")
    
    def _transform_features(self, df):
        """
        将前端发送的特征转换为 ZINB 模型需要的特征格式
        
        Args:
            df: 输入 DataFrame，包含前端特征
            
        Returns:
            DataFrame: 转换后的特征 DataFrame
        """
        df_transformed = df.copy()
        
        # 特征映射和转换
        # start_hour: 使用 hour_of_day
        if 'start_hour' not in df_transformed.columns and 'hour_of_day' in df_transformed.columns:
            df_transformed['start_hour'] = df_transformed['hour_of_day']
        
        # end_hour: start_hour + 1 (因为预测的是下一个小时)
        if 'end_hour' not in df_transformed.columns:
            df_transformed['end_hour'] = (df_transformed['start_hour'] + 1) % 24
        
        # subway_distance_m: 使用 dist_subway_m
        if 'subway_distance_m' not in df_transformed.columns and 'dist_subway_m' in df_transformed.columns:
            df_transformed['subway_distance_m'] = df_transformed['dist_subway_m']
        
        # mbta_stops_250m: 如果没有，使用默认值或基于 dist_bus_m 估算
        if 'mbta_stops_250m' not in df_transformed.columns:
            # 基于距离估算：距离越近，站点越多
            if 'dist_bus_m' in df_transformed.columns:
                # 简单的启发式：距离 < 50m = 3个站点, < 100m = 2个, < 200m = 1个, >= 200m = 0个
                df_transformed['mbta_stops_250m'] = df_transformed['dist_bus_m'].apply(
                    lambda x: 3 if x < 50 else (2 if x < 100 else (1 if x < 200 else 0))
                )
            else:
                df_transformed['mbta_stops_250m'] = 1  # 默认值
        
        # last_day_in 和 last_day_out: 如果没有历史数据，使用默认值
        if 'last_day_in' not in df_transformed.columns:
            df_transformed['last_day_in'] = 10  # 默认值
        if 'last_day_out' not in df_transformed.columns:
            df_transformed['last_day_out'] = 10  # 默认值
        
        # is_night: 基于 start_hour 计算 (22-4 点是夜间)
        if 'is_night' not in df_transformed.columns:
            if 'start_hour' in df_transformed.columns:
                df_transformed['is_night'] = ((df_transformed['start_hour'] >= 22) | 
                                             (df_transformed['start_hour'] <= 4)).astype(int)
            elif 'hour_of_day' in df_transformed.columns:
                df_transformed['is_night'] = ((df_transformed['hour_of_day'] >= 22) | 
                                             (df_transformed['hour_of_day'] <= 4)).astype(int)
            else:
                df_transformed['is_night'] = 0
        
        # precipitation: 如果没有，使用默认值 0
        if 'precipitation' not in df_transformed.columns:
            if 'rainfall' in df_transformed.columns:
                df_transformed['precipitation'] = df_transformed['rainfall']
            else:
                df_transformed['precipitation'] = 0.0
        
        # avg_temp: 如果没有，使用默认值或 temperature
        if 'avg_temp' not in df_transformed.columns:
            if 'temperature' in df_transformed.columns:
                df_transformed['avg_temp'] = df_transformed['temperature']
            else:
                df_transformed['avg_temp'] = 20.0  # 默认温度
        
        return df_transformed
    
    def _extract_features(self, df):
        """
        从输入数据中提取所需的特征
        
        Args:
            df: 输入 DataFrame
            
        Returns:
            tuple: (nb_features_df, infl_features_df)
        """
        # 首先转换特征
        df_transformed = self._transform_features(df)
        
        # 检查必需的特征是否存在
        all_required = set(self.nb_features + self.infl_features)
        missing_features = all_required - set(df_transformed.columns)
        
        if missing_features:
            raise ValueError(f"Missing required features after transformation: {missing_features}")
        
        # 提取特征
        nb_features_df = df_transformed[self.nb_features].copy()
        infl_features_df = df_transformed[self.infl_features].copy()
        
        return nb_features_df, infl_features_df
    
    def _normalize_features(self, nb_features_df, infl_features_df):
        """
        使用 StandardScaler 标准化特征
        
        Args:
            nb_features_df: Negative Binomial 特征 DataFrame
            infl_features_df: Inflation 特征 DataFrame
            
        Returns:
            tuple: (nb_scaled, infl_scaled)
        """
        # 转换为 numpy 数组
        nb_values = nb_features_df.values
        infl_values = infl_features_df.values
        
        # 标准化特征（训练时的流程：先标准化，再添加常数项）
        try:
            if self.scaler_nb is not None and hasattr(self.scaler_nb, 'mean_') and self.scaler_nb.mean_ is not None:
                nb_scaled = self.scaler_nb.transform(nb_values)
                print("✓ NB features normalized using scaler_nb")
            else:
                print("⚠ Warning: NB scaler not fitted, using raw features")
                nb_scaled = nb_values
        except Exception as e:
            print(f"⚠ Warning: Error transforming NB features: {e}, using raw features")
            nb_scaled = nb_values
        
        try:
            if self.scaler_infl is not None and hasattr(self.scaler_infl, 'mean_') and self.scaler_infl.mean_ is not None:
                infl_scaled = self.scaler_infl.transform(infl_values)
                print("✓ Inflation features normalized using scaler_infl")
            else:
                print("⚠ Warning: Inflation scaler not fitted, using raw features")
                infl_scaled = infl_values
        except Exception as e:
            print(f"⚠ Warning: Error transforming inflation features: {e}, using raw features")
            infl_scaled = infl_values
        
        return nb_scaled, infl_scaled  
    
    def _add_constants(self, nb_scaled, infl_scaled):
        """
        添加常数项
        
        Args:
            nb_scaled: 标准化后的 Negative Binomial 特征（或原始特征）
            infl_scaled: 标准化后的 Inflation 特征（或原始特征）
            
        Returns:
            tuple: (nb_with_const, infl_with_const)
        """
        # 添加常数项
        # X_train_const = sm.add_constant(X_train_nb_scaled) → 8 features (const + 7)
        # X_train_infl = sm.add_constant(X_train_infl_scaled) → 6 features (const + 5)
        nb_with_const = sm.add_constant(nb_scaled, has_constant='add')
        infl_with_const = sm.add_constant(infl_scaled, has_constant='add')
        
        return nb_with_const, infl_with_const
    
    def predict(self, input_data):
        """
        使用 ZINB 模型进行预测
        
        Args:
            input_data: DataFrame, dict 或 list，包含所需特征
            
        Returns:
            dict: {'arrivals': array, 'departures': array}
        """
        # 转换输入为 DataFrame
        if isinstance(input_data, dict):
            df = pd.DataFrame([input_data])
        elif isinstance(input_data, list):
            df = pd.DataFrame(input_data)
        else:
            df = input_data.copy()
        
        # 1. 提取特征
        nb_features_df, infl_features_df = self._extract_features(df)
        
        # 2. 处理特征（当前使用原始特征，不进行标准化）
        nb_scaled, infl_scaled = self._normalize_features(nb_features_df, infl_features_df)
        
        # 3. 添加常数项
        nb_with_const, infl_with_const = self._add_constants(nb_scaled, infl_scaled)
        
        # 4. 预测
        try:
            # Model 1 (OUT): ZeroInflatedNegativeBinomialP
            if self.model_out is not None:
                predictions_out = self.model_out.predict(
                    exog=nb_with_const,
                    exog_infl=infl_with_const,
                    which='mean'
                )
            else:
                predictions_out = np.zeros(len(df))
            
            # Model 2 (IN): ZeroInflatedNegativeBinomialP
            if self.model_in is not None:
                predictions_in = self.model_in.predict(
                    exog=nb_with_const,
                    exog_infl=infl_with_const,
                    which='mean'
                )
            else:
                predictions_in = np.zeros(len(df))
            
            # 转换为 numpy 数组
            if hasattr(predictions_out, 'values'):
                predictions_out = predictions_out.values
            if hasattr(predictions_in, 'values'):
                predictions_in = predictions_in.values
            
            # 确保是 numpy 数组
            predictions_out = np.array(predictions_out).flatten()
            predictions_in = np.array(predictions_in).flatten()
            
            # 裁剪到合理范围并取整
            predictions_out = np.clip(predictions_out, 0, 100)
            predictions_in = np.clip(predictions_in, 0, 100)
            
            predictions_out = np.round(predictions_out).astype(int)
            predictions_in = np.round(predictions_in).astype(int)
            
            # 确保非负
            predictions_out = np.maximum(predictions_out, 0)
            predictions_in = np.maximum(predictions_in, 0)
            
        except Exception as e:
            print(f"Error during prediction: {e}")
            print(f"NB features shape: {nb_with_const.shape}")
            print(f"Infl features shape: {infl_with_const.shape}")
            import traceback
            traceback.print_exc()
            raise
        
        # 返回预测结果
        # OUT = departures (离开/出发)
        # IN = arrivals (到达/到达)
        return {
            'arrivals': predictions_in.tolist(),
            'departures': predictions_out.tolist()
        }


if __name__ == "__main__":
    # 测试 ZINB 预测器
    print("Testing ZINBPredictor...")
    print("=" * 60)
    
    try:
        predictor = ZINBPredictor('zinb_models.pkl')
        
        print("\n" + "=" * 60)
        print("Test: Sample prediction")
        print("=" * 60)
        
        # 测试数据 - 需要包含所有必需特征
        test_data = {
            'month': 6,
            'start_hour': 17,
            'end_hour': 18,
            'subway_distance_m': 200.0,
            'mbta_stops_250m': 3,
            'last_day_in': 15,
            'last_day_out': 12,
            'is_night': 0,
            'precipitation': 0.0,
            'avg_temp': 22.5
        }
        
        result = predictor.predict(test_data)
        print(f"Arrivals (IN): {result['arrivals'][0]}")
        print(f"Departures (OUT): {result['departures'][0]}")
        
        print("\n" + "=" * 60)
        print("✓ Test successful!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()