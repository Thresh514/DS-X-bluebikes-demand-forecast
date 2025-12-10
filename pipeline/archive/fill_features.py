import pandas as pd
import numpy as np

# 读取两个文件
feature_df = pd.read_csv('data/feature.csv', keep_default_na=False)
station_features_df = pd.read_csv('data/2024_data/station_features_2024.csv')

print(f'feature.csv 有 {len(feature_df)} 行')
print(f'station_features_2024.csv 有 {len(station_features_df)} 行')

# 预处理：创建站名索引以提高匹配效率
name_index = {}
for idx, station_row in station_features_df.iterrows():
    station_name = str(station_row['station_name']).strip().lower()
    if station_name not in name_index:
        name_index[station_name] = []
    name_index[station_name].append(idx)

# 匹配函数：通过站名和经纬度
def find_match(row):
    name = str(row['Station_name']).strip()
    name_lower = name.lower()
    lat = float(row['Station latitude'])
    lng = float(row['Station longitude'])
    
    # 第一步：优先精确匹配站名
    if name_lower in name_index:
        # 如果有多个同名站点，选择经纬度最近的
        candidates = name_index[name_lower]
        if len(candidates) == 1:
            return candidates[0]
        else:
            # 多个同名站点，选择经纬度最近的
            best_idx = None
            min_distance = float('inf')
            for idx in candidates:
                station_row = station_features_df.iloc[idx]
                station_lat = float(station_row['lat'])
                station_lng = float(station_row['lng'])
                lat_diff = abs(station_lat - lat)
                lng_diff = abs(station_lng - lng)
                distance = np.sqrt(lat_diff**2 + lng_diff**2)
                if distance < min_distance:
                    min_distance = distance
                    best_idx = idx
            return best_idx
    
    # 第二步：如果站名不匹配，通过经纬度匹配（距离阈值约0.001度，约111米）
    best_match = None
    min_distance = float('inf')
    
    for idx, station_row in station_features_df.iterrows():
        station_lat = float(station_row['lat'])
        station_lng = float(station_row['lng'])
        
        # 计算经纬度距离（度）
        lat_diff = abs(station_lat - lat)
        lng_diff = abs(station_lng - lng)
        distance = np.sqrt(lat_diff**2 + lng_diff**2)
        
        if distance < min_distance and distance < 0.001:
            min_distance = distance
            best_match = idx
    
    return best_match

# 更新数据
print('\n开始匹配和更新数据...')
matched_count = 0
unmatched_stations = []

for idx, row in feature_df.iterrows():
    matched_idx = find_match(row)
    
    if matched_idx is not None:
        station_row = station_features_df.iloc[matched_idx]
        # 更新三个特征（索引13, 14, 15）
        feature_df.iloc[idx, 13] = station_row['num_attractions_r500']  # Number of tourist attractions nearby
        feature_df.iloc[idx, 14] = station_row['dist_to_bikelane']  # Proximity to bike lanes
        feature_df.iloc[idx, 15] = station_row['dist_to_park']  # Proximity to parks
        matched_count += 1
        print(f'✓ 行 {idx+1}: {row["Station_name"]} -> {station_row["station_name"]}')
        print(f'  景点数: {station_row["num_attractions_r500"]}, 自行车道: {station_row["dist_to_bikelane"]:.2f}m, 公园: {station_row["dist_to_park"]:.2f}m')
    else:
        unmatched_stations.append(row["Station_name"])
        print(f'✗ 行 {idx+1}: {row["Station_name"]} - 未找到匹配')

print(f'\n成功匹配 {matched_count}/{len(feature_df)} 个站点')

if unmatched_stations:
    print(f'\n警告：以下站点未找到匹配：')
    for station in unmatched_stations:
        print(f'  - {station}')

# 保存文件
feature_df.to_csv('data/featurenew.csv', index=False)
print('\n已保存更新后的 featurenew.csv')