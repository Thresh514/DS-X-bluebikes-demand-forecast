# Bluebikes 需求预测 - 可视化与结果汇总

本目录包含 Bluebikes 需求预测项目的所有可视化图片和模型评估结果。

---

## 📁 目录结构

```
visualizations/
├── README.md                          # 本文档
├── IMAGE_INVENTORY.md                 # 图片清单（来源、说明）
├── METRICS_INVENTORY.md               # 指标清单（详细的模型结果）
├── model_metrics_summary.csv          # 模型指标汇总表（CSV 格式）
├── model_comparison_table.md          # 模型对比表（Markdown 格式）
│
├── 01_data_exploration/               # 数据探索可视化
│   ├── global_in_distribution.png     # 全局 IN 计数分布
│   ├── global_out_distribution.png    # 全局 OUT 计数分布
│   ├── top20_stations_table.png       # Top 20 繁忙站点表格
│   └── station_distributions/         # 各站点详细分布
│       ├── station_*_distribution.png # 各站点 IN/OUT 分布
│       └── station_*_rush_hours.png   # 各站点早晚高峰分布
│
├── 02_time_series/                    # 时间序列分析
│   ├── mit_hourly_timeseries.png      # MIT 站点每小时时序
│   ├── mit_hour_of_day.png            # 按小时聚合（展示高峰）
│   ├── mit_hourly_by_month.png        # 按月份分组（季节性）
│   └── monthly/                       # 各月份详细图
│       └── mit_mass_ave_hourly_2024*.png  # 12 个月的图
│
├── 03_poisson_model/                  # Poisson 回归模型
│   ├── confusion_matrix_train.png     # 训练集混淆矩阵
│   ├── confusion_matrix_test.png      # 测试集混淆矩阵
│   └── alpha_comparison.png           # 不同 alpha 参数对比
│
├── 04_nb_boosting_model/              # NB + Boosting 模型
│   ├── nb_confusion_matrix_train.png  # NB 训练集混淆矩阵
│   ├── nb_confusion_matrix_test.png   # NB 测试集混淆矩阵
│   ├── boosting_confusion_matrix_train.png  # Boosting 训练集混淆矩阵
│   ├── boosting_confusion_matrix_test.png   # Boosting 测试集混淆矩阵
│   └── improvement_comparison.png     # 性能提升对比图
│
└── 05_zinb_model/                     # ZINB 模型
    ├── zinb_evaluation_grid.png       # 12 子图综合评估
    └── feature_importance.png         # 特征系数对比
```

---

## 📊 快速导航

### 1️⃣ 数据探索与理解

**目的**: 了解数据分布特征、站点活跃度、时间模式

**关键图片**:
- 📈 [时间序列 - MIT 站点每小时流量](02_time_series/mit_hourly_timeseries.png)  
  **说明**: 显示 2024 年全年的每小时 in/out 流量，可观察到明显的周期性（工作日 vs 周末）和季节性（夏季高峰）
  
- 📊 [小时流量模式](02_time_series/mit_hour_of_day.png)  
  **说明**: 聚合后的 24 小时流量曲线，清晰展示早高峰（7-9am）和晚高峰（5-7pm）
  
- 🗓️ [月度季节性变化](02_time_series/mit_hourly_by_month.png)  
  **说明**: 不同月份的流量差异，夏秋季（6-10月）流量最高，冬季（1-2月）流量最低

**关键发现**:
- 🏆 **Top 1 站点**: MIT at Mass Ave / Amherst St (132,619 次出行)
- 📉 **零值比例**: 约 28% 的观测值为 0（零膨胀特征）
- 📈 **过度离散**: Variance (43.8) >> Mean (6.9)，不符合 Poisson 假设

---

### 2️⃣ 模型建模历程

#### 路线 1: Poisson → NegBin → NB+Boosting

**动机**: 
- Poisson 回归是计数数据的经典模型
- 发现数据过度离散后改用 Negative Binomial
- 通过 Boosting 进一步提升性能

**关键结果**:

| 模型 | 测试集 MAE | 测试集 RMSE | 改进幅度 |
|------|-----------|------------|---------|
| Poisson | 4.479 | 5.998 | 基准 |
| NegativeBinomial | ~4.5 | ~6.0 | 与 Poisson 相近 |
| **NB+Boosting** | **2.736** | **3.887** | **-39% / -35%** |

**详细指标**: 见 [`METRICS_INVENTORY.md`](METRICS_INVENTORY.md#1-poisson-回归模型)

**可视化**:
- 混淆矩阵（分类任务）: `03_poisson_model/confusion_matrix_*.png`
- 性能对比: `04_nb_boosting_model/improvement_comparison.png`

---

#### 路线 2: ZINB (Zero-Inflated Negative Binomial)

**动机**: 
- 数据存在约 28% 的零值，需要专门建模零膨胀特征
- ZINB 将"结构性零"和"偶然性零"分离

**关键结果**:

| 目标 | MAE | RMSE | R² | π (零膨胀概率) | μ (NB 均值) |
|------|-----|------|-----|---------------|------------|
| OUT | 3.696 | 5.677 | 0.184 | 0.289 | 5.497 |
| IN | 3.708 | 5.609 | 0.171 | 0.285 | 5.555 |

**特征重要性** (IN 模型):
- ✅ **正向影响**: end_hour (+), bus_distance_m (+), latitude (+)
- ❌ **负向影响**: month (-), day_of_week (-), start_hour (-)

**详细指标**: 见 [`METRICS_INVENTORY.md`](METRICS_INVENTORY.md#4-zinb-zero-inflated-negative-binomial-模型)

**可视化**:
- 综合评估图（12 子图）: `05_zinb_model/zinb_evaluation_grid.png`
  - 实际 vs 预测散点图
  - 残差分析
  - π 和 μ 分布
  - 特征系数对比
  - 性能指标对比

---

## 📈 核心可视化说明

### 时间序列类

#### 1. MIT 站点每小时时序 (`02_time_series/mit_hourly_timeseries.png`)
- **X 轴**: 时间（2024 年 9 月至 10 月）
- **Y 轴**: 出行次数
- **特征**: 
  - 蓝色线 = OUT (出发)
  - 橙色线 = IN (到达)
  - 周期性波动明显（工作日高，周末低）
  - 夜间接近零

#### 2. 24 小时流量模式 (`02_time_series/mit_hour_of_day.png`)
- **X 轴**: 一天中的小时 (0-23)
- **Y 轴**: 月度总出行次数
- **特征**:
  - 凌晨 4-5 点最低（接近零）
  - 早高峰：7-9 点快速上升
  - 晚高峰：17-18 点达到最高峰（~1150 次/小时）
  - 晚间逐渐下降

#### 3. 月度季节性 (`02_time_series/mit_hourly_by_month.png`)
- **多条线**: 每条代表一个月份
- **特征**:
  - 2024 年 9 月（粉色）流量最高
  - 冬季月份（1-2 月）流量最低
  - 所有月份都保持早晚高峰模式

---

### 模型评估类

#### 1. 混淆矩阵热力图
- **用途**: 评估分类任务（高需求 vs 低需求）
- **阅读方式**:
  - 对角线数值越大越好（正确分类）
  - 左下角 = False Negative（漏检高需求）
  - 右上角 = False Positive（误报高需求）
- **位置**: 
  - Poisson: `03_poisson_model/confusion_matrix_*.png`
  - NB+Boosting: `04_nb_boosting_model/*_confusion_matrix_*.png`

#### 2. ZINB 综合评估图 (`05_zinb_model/zinb_evaluation_grid.png`)
- **12 个子图布局** (3×4):
  - **Row 1**: OUT 模型（实际vs预测、残差、π分布、μ分布）
  - **Row 2**: IN 模型（实际vs预测、残差、π分布、μ分布）
  - **Row 3**: 对比分析（OUT vs IN、系数对比、性能指标、零比例）
- **关键观察**:
  - 散点图：点越接近对角线，预测越准确
  - 残差图：应随机分布在 y=0 附近
  - π 和 μ 分布：展示模型预测的概率分布特征

---

## 📋 模型性能总结表

完整的模型对比表见 [`model_comparison_table.md`](model_comparison_table.md)

### 快速对比（测试集 MAE - IN 预测）

```
📊 性能排名：

🥇 NB+Boosting:    2.736  ★★★★★ (最佳)
🥈 ZINB:           3.708  ★★★★☆
🥉 Poisson:        4.479  ★★★☆☆
```

### 模型选择建议

| 场景 | 推荐模型 | 理由 |
|------|---------|------|
| 🎯 **最佳性能** | **NB+Boosting** | MAE 2.7，显著优于其他模型 |
| 📊 **可解释性** | **ZINB** | 提供分布参数和零膨胀概率 |
| 📚 **教学演示** | **Poisson → NegBin** | 展示建模演进过程 |

---

## 📄 文档说明

### 1. [`IMAGE_INVENTORY.md`](IMAGE_INVENTORY.md)
- 所有图片的详细清单
- 每张图的来源 notebook 和单元格编号
- 图片说明和预期文件名

### 2. [`METRICS_INVENTORY.md`](METRICS_INVENTORY.md)
- 所有模型的数值结果
- 按模型类型组织
- 包含训练集和测试集指标
- 特征重要性系数表

### 3. [`model_metrics_summary.csv`](model_metrics_summary.csv)
- CSV 格式的指标汇总
- 可直接导入 Excel/Python 进行分析
- 列字段：model_type, target, mae, rmse, r2, f1, 等

### 4. [`model_comparison_table.md`](model_comparison_table.md)
- Markdown 格式的对比表
- 包含性能改进百分比
- 提供关键发现和建议

---

## 🔄 使用流程

### 查看可视化结果

1. **了解数据**: 先看时间序列图 (`02_time_series/`)
2. **探索站点**: 查看站点分布 (`01_data_exploration/`)
3. **比较模型**: 阅读 [`model_comparison_table.md`](model_comparison_table.md)
4. **深入细节**: 查看各模型目录中的混淆矩阵和评估图

### 提取指标用于报告

1. 打开 [`model_comparison_table.md`](model_comparison_table.md)
2. 复制需要的表格到报告中
3. 或使用 [`model_metrics_summary.csv`](model_metrics_summary.csv) 生成自定义图表

### 重新生成图片

1. 参考 [`IMAGE_INVENTORY.md`](IMAGE_INVENTORY.md) 找到对应的 notebook 和单元格
2. 运行相应的单元格
3. 使用 `plt.savefig()` 保存到对应目录

---

## ⚙️ 技术细节

### 数据时间范围
- **训练数据**: 2023 年部分月份（具体见各 notebook）
- **评估数据**: 2024 年 1-12 月

### 特征工程
- **时间特征**: month, day_of_week, start_hour, end_hour, is_weekend
- **站点特征**: latitude, longitude, station_id
- **距离特征**: dist_subway_m, dist_bus_m, dist_university_m

### 评估指标
- **回归**: MAE (平均绝对误差), RMSE (均方根误差), R²
- **分类**: Precision, Recall, F1 Score
- **分布**: π (零膨胀概率), μ (NB 均值), α (分散参数)

---

## 📝 更新日志

- **2025-12-09**: 初始版本创建
  - ✅ 复制时间序列图片（15 张）
  - ✅ 创建目录结构
  - ✅ 整理指标清单
  - ✅ 生成对比表格
  - ✅ 生成模型评估图片

---

*最后更新: 2025-12-09*  
*项目: Bluebikes Demand Forecast*  
*课程: CS506 - Fall 2025*
