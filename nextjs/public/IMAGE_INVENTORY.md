# 图片清单 (Image Inventory)

本文档列出所有从 Jupyter Notebook 提取的可视化图片。

---

## 📊 01_data_exploration/ - 数据探索

### 全局分布
| 文件名 | 来源 | 描述 |
|--------|------|------|
| `global_distribution.png` | `data/BluebikeForecast.ipynb` Cell 10 | 全局 IN/OUT 计数分布直方图 |

### 站点分布 (station_distributions/)
共 40 张图片，每个站点 2 张：

| 站点编号 | 分布图 | 早晚高峰图 | 来源 |
|---------|--------|-----------|------|
| 01 | `station_01_distribution.png` | `station_01_rush_hours.png` | Cell 14 & 16 |
| 02 | `station_02_distribution.png` | `station_02_rush_hours.png` | Cell 14 & 16 |
| 03 | `station_03_distribution.png` | `station_03_rush_hours.png` | Cell 14 & 16 |
| 04 | `station_04_distribution.png` | `station_04_rush_hours.png` | Cell 14 & 16 |
| 05 | `station_05_distribution.png` | `station_05_rush_hours.png` | Cell 14 & 16 |
| 06 | `station_06_distribution.png` | `station_06_rush_hours.png` | Cell 14 & 16 |
| 07 | `station_07_distribution.png` | `station_07_rush_hours.png` | Cell 14 & 16 |
| 08 | `station_08_distribution.png` | `station_08_rush_hours.png` | Cell 14 & 16 |
| 09 | `station_09_distribution.png` | `station_09_rush_hours.png` | Cell 14 & 16 |
| 10 | `station_10_distribution.png` | `station_10_rush_hours.png` | Cell 14 & 16 |
| 11 | `station_11_distribution.png` | `station_11_rush_hours.png` | Cell 14 & 16 |
| 12 | `station_12_distribution.png` | `station_12_rush_hours.png` | Cell 14 & 16 |
| 13 | `station_13_distribution.png` | `station_13_rush_hours.png` | Cell 14 & 16 |
| 14 | `station_14_distribution.png` | `station_14_rush_hours.png` | Cell 14 & 16 |
| 15 | `station_15_distribution.png` | `station_15_rush_hours.png` | Cell 14 & 16 |
| 16 | `station_16_distribution.png` | `station_16_rush_hours.png` | Cell 14 & 16 |
| 17 | `station_17_distribution.png` | `station_17_rush_hours.png` | Cell 14 & 16 |
| 18 | `station_18_distribution.png` | `station_18_rush_hours.png` | Cell 14 & 16 |
| 19 | `station_19_distribution.png` | `station_19_rush_hours.png` | Cell 14 & 16 |
| 20 | `station_20_distribution.png` | `station_20_rush_hours.png` | Cell 14 & 16 |

**图片说明：**
- `station_XX_distribution.png`: 各站点 IN/OUT 计数的频率分布直方图
- `station_XX_rush_hours.png`: 各站点早晚高峰时段的流量分布

---

## 📈 02_time_series/ - 时间序列

| 文件名 | 来源 | 描述 |
|--------|------|------|
| `mit_hourly_timeseries.png` | `pipeline/` | MIT Mass Ave 站点全年每小时 IN/OUT 时间序列 |
| `mit_hour_of_day.png` | `pipeline/` | MIT Mass Ave 站点按小时聚合的月度总量 |
| `mit_hourly_by_month.png` | `pipeline/` | MIT Mass Ave 站点各月份的小时流量曲线 |

### 月度图 (monthly/)
| 文件名 | 描述 |
|--------|------|
| `mit_mass_ave_hourly_202401.png` | 2024年1月每小时流量 |
| `mit_mass_ave_hourly_202402.png` | 2024年2月每小时流量 |
| `mit_mass_ave_hourly_202403.png` | 2024年3月每小时流量 |
| `mit_mass_ave_hourly_202404.png` | 2024年4月每小时流量 |
| `mit_mass_ave_hourly_202405.png` | 2024年5月每小时流量 |
| `mit_mass_ave_hourly_202406.png` | 2024年6月每小时流量 |
| `mit_mass_ave_hourly_202407.png` | 2024年7月每小时流量 |
| `mit_mass_ave_hourly_202408.png` | 2024年8月每小时流量 |
| `mit_mass_ave_hourly_202409.png` | 2024年9月每小时流量 |
| `mit_mass_ave_hourly_202410.png` | 2024年10月每小时流量 |
| `mit_mass_ave_hourly_202411.png` | 2024年11月每小时流量 |
| `mit_mass_ave_hourly_202412.png` | 2024年12月每小时流量 |

---

## 🔢 03_poisson_model/ - Poisson 回归模型

| 文件名 | 来源 | 描述 |
|--------|------|------|
| `confusion_matrix_train.png` | `poisson_with_features.ipynb` Cell 22 | 训练集混淆矩阵 |
| `confusion_matrix_test.png` | `poisson_with_features.ipynb` Cell 22 | 测试集混淆矩阵 |

---

## 🚀 04_nb_boosting_model/ - NB + Boosting 模型

| 文件名 | 来源 | 描述 |
|--------|------|------|
| `boosting_confusion_matrix_train.png` | `nb_with_boosting.ipynb` Cell 22 | 训练集混淆矩阵 |
| `boosting_confusion_matrix_test.png` | `nb_with_boosting.ipynb` Cell 22 | 测试集混淆矩阵 |

---

## 🎯 05_zinb_model/ - ZINB 模型

| 文件名 | 来源 | 描述 |
|--------|------|------|
| `zinb_evaluation_grid.png` | `data/BluebikeForecast.ipynb` Cell 30 | ZINB 模型综合评估图 (12 子图) |

**ZINB 评估图包含：**
1. OUT: Actual vs Predicted 散点图 (R² = 0.1844)
2. OUT: Residual Plot 残差图
3. OUT: Distribution of π (零膨胀概率分布)
4. OUT: Distribution of μ (NB均值分布)
5. IN: Actual vs Predicted 散点图 (R² = 0.1713)
6. IN: Residual Plot 残差图
7. IN: Distribution of π
8. IN: Distribution of μ
9. Predicted OUT vs IN 对比
10. Count Model Coefficients 特征系数对比
11. Model Performance Comparison (RMSE, MAE, R²)
12. Zero Proportions 零值比例对比

---

## 📊 统计

| 类别 | 图片数量 |
|------|---------|
| 数据探索 | 41 |
| 时间序列 | 15 |
| Poisson 模型 | 2 |
| NB+Boosting 模型 | 2 |
| ZINB 模型 | 1 |
| **总计** | **61** |

---

*最后更新: 2024年12月*
