# Bluebikes Demand Forecasting — Project Proposal

**Team:** Matthew Yan · Jiayong Tu · Fenglin Hu · Mingyu Shen  
**Course:** CS 506 </br>
**Midpoint Video Link:** https://www.youtube.com/watch?v=Canmt5Fn1VQ

---

# Project Description
We will use **Bluebikes’ public data** to study demand by station and time, and to **predict near-term availability (bikes and docks)** at each Bluebikes station in the next 60 minutes, powered by **live data and a lightweight ML model**.

---

## Why It Matters
- **Riders:** Can avoid empty or full stations before they arrive.  
- **Planners:** Can identify problem stations and times and act earlier.

---

## Goals
- **Prediction:** For any station *s* and future time (hourly) *t*, predict the number of available bikes and docks.  
- **Behavior:** For any station *s* and future time (hourly) *t*, predict the number of bikes rented by Bluebike riders.

---

## How We Measure Success
- Keep **average error ≈ 3 bikes** and **RMSE ≈ 5 bikes** on the top ~50 stations.  
- Risk warnings should be **≥ 80% accurate** (thresholds tuned on validation set).  
- Beat baselines:  
  - “Use last hour”  
  - “Use the average for this hour of the week”

---

## Data Sources
### 1. Trip History (CSV)
- **What:** Start/end time, start/end station, rider type (member/casual), trip duration.  
- **Why:** Identify bike usage patterns across locations and time.  
- **Where:** Bluebikes website (monthly data).

### 2. Station Selection Criteria
- Focus on **Top-50 busiest stations** for stable signals.  
- Rank by **monthly total trips** (starts + ends).  
- Ensure **geographic diversity** (downtown, campus, residential).  
- Keep set fixed during testing to avoid data leakage.

### 3. Weather Data
- **What:** Hourly temperature, rain/snow, wind, condition.  
- **Why:** Weather strongly affects bike use.  
- **Where:** National Weather Service (monthly data) or equivalent.

---

## Hypotheses
1. **Temporal Influence:** Time of day and weekday/weekend patterns drive short-term demand (commute peaks).  
2. **Weather Impact:** Temperature and precipitation influence ridership, especially among casual users.  
3. **Spatial Dependency:** Proximity to transport hubs, universities, or residential zones correlates with demand.

---

## Data Processing Pipeline
Implemented using **Python** and **pandas**.

### 1. Raw Data Loading
- Standardized schema for monthly trip files.  
- Parsed timestamps into `datetime` after initial string loading.

### 2. Timestamp Normalization
- Rounded start/stop times to **nearest hour** to form hourly bins.  
- Reduced noise and aligned reporting intervals.

### 3. Station Metadata Merging
- Unified table with **station ID, name, latitude, longitude**.  
- Enabled spatial visualization and analysis.

### 4. Hourly Aggregation
- For each station and hour:
  - Count of bikes rented (**out**)  
  - Count of bikes returned (**in**)  
- Filled missing values with zeros for completeness.

### 5. Feature Engineering
Added contextual features:
- Hour of week (0–167)  
- Month  
- Weekend indicator  
- Geographic coordinates  
- Optional weather features (temperature, rain, wind)

Result: Clean, structured, **time-series ready** dataset.

---

## Preliminary Data Exploration
### Observations
- **Temporal trends:** Peaks at 8–9 AM and 5–7 PM on weekdays.  
- **Seasonality:** Higher ridership on warm days.  
- **Spatial variation:** Downtown and campus areas are busiest.  
- **Low-variation stations:** Flat trends → potential noise.

These insights guided **feature design** and **station selection**.

---

## Model Selection
Two main predictive models were tested: **Linear Regression** and **XGBoost Regression**.

### Linear Regression
- Served as baseline model — interpretable and quick to train.  
- Captured broad linear relationships between time, weather, and demand.  
- **Limitation:** Could not model nonlinear peaks or weather interactions.

### XGBoost Regression
- Chosen as the **primary model** for nonlinear and complex relationships.  
- Handles **missing data, outliers**, and large datasets efficiently.  
- Parallelized training for millions of hourly records.

**Strengths:**
- Captures nonlinear time–weather–location interactions.  
- Robust to real-world noise.  
- Scalable for real-time use.

---

## Preliminary Results
- **Average difference:** ≈ 1 bike per station per hour.  
- **Low RMSE (< 2):** High prediction stability.  
- Accurately models short-term demand patterns.  
- Suitable for near-real-time prediction deployment.

---

## Challenges
- **Timestamp inconsistency:** Multiple date formats.  
- **Low-variation stations:** Flat signals confused the model.  
- **Concept drift:** Seasonal/academic schedule changes.  
- **Large data volume:** Performance and storage issues during aggregation.

---

## Next Steps
### 1. Enhance Location-Based Features
Add spatial data such as:
- Distance to subway or bus routes.  
- Nearby intersections and traffic density.

### 2. Refine Low-Variation Station Handling
- Identify low-change stations and introduce small **ε adjustments**.  
- Maintain stability without overfitting.

### 3. Future Model Integration
- Retrain XGBoost with enhanced features.  
- Compare with baseline (**MAE ≈ 1.03**, **RMSE ≈ 1.93**).  
- Evaluate consistency across neighborhoods.

### 4. Long-Term Development
- Integrate **live weather and station status feeds**.  
- Explore **15-minute forecast windows**.  
- Add **uncertainty estimates** and interactive dashboards.

---

## Summary
We have built a **complete data processing and ML pipeline** for short-term Bluebike demand forecasting.  
The **XGBoost model** significantly outperforms simple baselines, achieving ~1 bike/hour accuracy.  
Next steps include refining spatial features, incorporating real-time data, and developing an **interactive visualization platform** for users and city planners.

This marks strong progress toward a **fully functional predictive system** for the Bluebikes network.

