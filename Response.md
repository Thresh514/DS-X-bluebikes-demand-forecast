很好，这样你们的目标就非常清晰了：

> **实时预测每个 Bluebikes 站点在一小时后可用车辆数量（或进出流量），结合实时 API 数据进行动态展示。**

我帮你梳理一下完整可落地的架构和做法（适合 30h Hackathon），确保能跑、能演示、也有亮点。

---

## 🚲 一、核心思路

你们要实现一个**实时预测 + 可视化系统**：

1. **实时数据输入：** 从 Bluebikes 的 live map API（GBFS feed）拉当前各站的车桩数量。
2. **历史数据训练：** 用月度 trip CSV + 过去的 live snapshots 训练一个模型，学会预测“1小时后某站车数”。
3. **预测引擎：** 每5分钟读取最新状态 → 预测1小时后的数量。
4. **前端展示：** 地图显示“当前 vs 预测”，并用颜色区分风险（比如快没车或快满桩）。

---

## 🔗 二、API 来源（Bluebikes 官方 GBFS）

Bluebikes 的 GBFS（General Bikeshare Feed Specification）是公开的，结构非常固定。

### 1. 站点信息（静态）

[https://gbfs.bluebikes.com/gbfs/en/station_information.json](https://gbfs.bluebikes.com/gbfs/en/station_information.json)

包含：

```json
{
  "data": {
    "stations": [
      {
        "station_id": "3",
        "name": "Boylston St at Arlington St",
        "capacity": 19,
        "lat": 42.3521,
        "lon": -71.0679
      }
    ]
  }
}
```

### 2. 实时状态（动态）

[https://gbfs.bluebikes.com/gbfs/en/station_status.json](https://gbfs.bluebikes.com/gbfs/en/station_status.json)

包含：

```json
{
  "data": {
    "stations": [
      {
        "station_id": "3",
        "num_bikes_available": 4,
        "num_docks_available": 15,
        "last_reported": 1735062150
      }
    ]
  }
}
```

---

## 🧠 三、数据流架构（推荐简化版）

Hackathon 时间有限 → 不要上数据库，用 **DuckDB + Parquet 文件** 就够：

```
src/
  ingest/live_fetch.py         # 每5分钟拉一次API
  features/build_dataset.py    # 从历史trip聚合
  models/predict.py            # 用最新状态预测未来
  viz/app.py                   # Streamlit地图展示
data/
  raw/
  processed/
  live/
```

---

## ⚙️ 四、预测模型设计（轻量快速）

### 1️⃣ 输入特征

每个站点的当前状态 + 时间特征：

| Feature                | 描述                   |
| ---------------------- | -------------------- |
| station_id             | 站点编号                 |
| bikes_now              | 当前可用车数（API提供）        |
| docks_now              | 当前空桩数                |
| hour                   | 当前小时（0–23）           |
| dayofweek              | 星期几（0–6）             |
| is_weekend             | 是否周末                 |
| lag_15, lag_30, lag_60 | 历史平均车数变化（从历史trip数据算） |

### 2️⃣ 输出目标

* `bikes_in_1h`（预测一小时后可用车数）
  或者预测 `Δbikes_next_1h = bikes_now - bikes_in_1h` 也行。

### 3️⃣ 模型

快速可训练：

* Linear Regression（快速可解释）
* 或 XGBoost（树模型更稳）

---

## 🧩 五、实时预测脚本示例（核心）

下面是可以直接用的伪代码骨架：

```python
# src/models/predict.py
import requests, pandas as pd
import joblib
from datetime import datetime

# 1. 读取实时状态
status = requests.get("https://gbfs.bluebikes.com/gbfs/en/station_status.json").json()["data"]["stations"]
info = requests.get("https://gbfs.bluebikes.com/gbfs/en/station_information.json").json()["data"]["stations"]

df_status = pd.DataFrame(status)
df_info = pd.DataFrame(info)

df = df_status.merge(df_info, on="station_id")

# 2. 构造特征
now = datetime.now()
df["hour"] = now.hour
df["dayofweek"] = now.weekday()
df["is_weekend"] = df["dayofweek"] >= 5
df["bikes_now"] = df["num_bikes_available"]
df["docks_now"] = df["num_docks_available"]

X = df[["bikes_now", "docks_now", "hour", "dayofweek", "is_weekend"]]

# 3. 载入模型并预测
model = joblib.load("models/xgb_model.pkl")
df["pred_bikes_1h"] = model.predict(X)

# 4. 输出结果到前端
df.to_json("data/live/predictions.json", orient="records")
```

---

## 🗺️ 六、Streamlit 实时展示（示例）

```python
# src/viz/app.py
import streamlit as st
import pandas as pd
import folium
from streamlit_folium import st_folium

st.set_page_config(page_title="Bluebikes Predictor", layout="wide")
st.title("Bluebikes: Live + 1-hour Forecast")

# 读取预测结果
data = pd.read_json("data/live/predictions.json")

# 地图中心点
center = [data["lat"].mean(), data["lon"].mean()]
m = folium.Map(location=center, zoom_start=13)

for _, row in data.iterrows():
    color = "green" if row["pred_bikes_1h"] > row["bikes_now"] else "red"
    folium.CircleMarker(
        [row["lat"], row["lon"]],
        radius=6,
        color=color,
        fill=True,
        fill_opacity=0.7,
        popup=f"{row['name']}<br>Now: {row['bikes_now']}<br>Predicted: {row['pred_bikes_1h']:.1f}"
    ).add_to(m)

st_folium(m, width=1000, height=600)
```

→ 一运行 `streamlit run src/viz/app.py`
你就能实时看到每个站的当前车数 + 预测一小时后的值。

---

## 🧩 七、30小时内可以做到的目标

✅ 最小可运行原型（能演示）：

1. 拉取实时 API；
2. 用历史数据训练轻量模型；
3. 预测 1 小时后每站车数；
4. 地图展示当前 vs 预测；
5. 颜色代表“是否缺车/满桩风险”。

---

## ⚡ 推荐分工

| 角色        | 内容                            |
| --------- | ----------------------------- |
| A (Data)  | 历史 trips 数据 → 特征构造（lag、hour等） |
| B (Model) | 训练 & 保存模型                     |
| C (API)   | 连接 live map，生成预测 JSON         |
| D (Front) | Streamlit 地图和展示逻辑             |

---

要我帮你直接写出一个**完整可运行的原型模板**（包含训练脚本、实时预测、Streamlit 页面）吗？
这样你们直接 clone 下来改站点就能跑，用在 Hackathon 里展示。
