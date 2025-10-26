# Bluebikes Demand Forecasting — Project Proposal

**Team:** Matthew Yan · Jiayong Tu · Fenglin Hu · Mingyu Shen  
**Course:** CS 506

---

### Overall Summary
- **What we’re building:** Our project aims to predict the bike/dock availability for any given station in the **next 60 minutes.** We’ll also compare how **members** and **casual riders** use the system.
- **Why it helps:** Riders can pick a better station before they arrive; organizers get a quick view of hot spots and risk.
- **Data we’ll use:** Trip history CSVs from Bluebikes, a station list with capacity, the **live station status feed** (we’ll save a copy every 5 minutes), and optional weather.
- **How we’ll judge success:** We plan to train our model on earlier data and test it on more recent data. We plan to evaluate our success by seeing how close our model's prediction of a bike stand's availability at a specific time is to the bike stand's actual availability at the specified time.
- **Timeline:** 8-9 weeks (2 months)


## 1) Project Description
We will use Bluebikes’ public data to study demand **by station and time** and to **predict near‑term availability** (bikes and docks). We will also compare **members vs casual riders** to see when and where they ride, and how long their trips are. The scope fits a 8‑week student project with a simple baseline, steady improvements, and a small interactive demo.

### Goals
- **Prediction:** Predict, for any station *s* at future time *t*, the number of available bikes and docks.
- **Behavior:** Predict, for any station *s* at future time *t*, the number of bikes rented by Bluebike members vs casual riders.

### What we’re **not** doing
- **Long-range forecasts beyond a day**: We are limiting our scope to **short-term, near-real-time predictions (next 60 min, optionally 15 min)**.  
  Long-term forecasting (days/weeks ahead) would require additional external factors like seasonality, event schedules, and deeper weather trends, which is out of scope for this 8-week project.  

- **Full city rebalancing/operations optimization**: We are **not designing algorithms to suggest truck routes or move bikes** around the city to balance inventory.  
  That would involve logistics optimization and simulation, which is beyond our current scope. Instead, we only provide **station-level demand predictions** that could later inform such systems.



### Why it matters
- Riders can avoid empty or full stations before they get there.
- Planners can spot problem stations and times and act earlier.

## 2) Goals & Success Criteria
### Goals
- **Prediction:** Predict, for any station *s* at future time (hourly) *t*, the number of available bikes and docks.
- **Behavior:** Predict, for any station *s* at future time (hourly) *t*, the number of bikes rented by Bluebike members vs casual riders.

### How we measure success:
- Keep **average error ≈ 3 bikes** and **typical squared error ≈ 5 bikes RMSE** on the top ~50 stations.
- Risk warnings should be **right ~80%+ of the time** (we’ll tune thresholds on a validation set).
- Beat simple baselines: “use last hour” and “use the average for this hour of the week.”

## 3) Data to Collect & How
### Trip history (CSV)
- **What:** start/end time, start/end station, rider type (member/casual), trip duration.
- **Why:** Data used to identify bike usage patterns at different locations and times.
- **Where:** [Bluebikes website (monthly data)](https://s3.amazonaws.com/hubway-data/index.html).
- **Station selection criteria**
  - We will focus modeling/evaluation on a fixed **Top-50 busiest stations** to ensure stable signals:
  - Rank by monthly total trips (starts + ends) during the training period.
  - Ensure geographic diversity (e.g., downtown, campus areas, residential neighborhoods).
  - Keep the set fixed for test to avoid selection leakage.

### 3.2 Weather (optional)
- **What:** hourly temperature, rain/snow, wind, general condition.
- **Why:** Weather strongly affects bike use.
- **Where:** [National Weather Service (monthly data)](https://www.weather.gov/wrh/climate?wfo=box) or another similar service

## 4) Modelling the Data

### Framing

We treat this as a **short-term time-series forecasting** problem framed as regression.
Each sample represents a station’s bike/dock availability at a given time, and features include both **recent history** (e.g., last 1–2 hours) and **contextual factors** (hour of day, weather, etc.).

### Baseline Model

* **Persistence model:** use the most recent observation (or average of the last hour) as the prediction.
  This provides a simple benchmark to measure improvement.

### Main Models

* **XGBoost (linear booster / gblinear):** chosen as the primary regressor after feature selection, given the small feature space and weak inter-feature correlations.
* **Linear regression:** used as a simple, interpretable baseline.
  All models use **time-ordered train/test splits** and **early stopping** (where applicable) to prevent overfitting.

### Features

* Recent lagged values (e.g., available bikes in past 15, 30, 60 min)
* Hour-of-week, weekend/holiday indicators
* Station capacity and popularity rank
* Weather features (temperature, precipitation, wind, condition)

After feature selection, we retained a compact set of features. Empirically, pairwise correlations among retained features and with the target were generally weak, which informed our choice to emphasize a linear booster in XGBoost and a linear regression baseline.

### Model Evaluation & Checks

* Compare model performance against the persistence baseline using MAE and RMSE.
* Ensure **no future data leakage** by using chronological splits.
* Analyze **feature importance** to explain which factors drive predictions.
  
### Empirical Findings & Data Quality

- We observed substantial noise in the station availability time series and a high prevalence of outliers.
- The live data collection pipeline (GBFS station_status snapshots) exhibited occasional missing, duplicated, or misaligned records, which introduced label noise and reduced signal quality.
- As a result, the retained features displayed low or near‑zero correlation with targets in many stations/time windows, and models offered limited lift over the persistence baseline.


## 5) Visualization Plan
- **Interactive heat map:** display prediction of bike availability of all bluebike stops on a map through different color/size based on each location's predicted availability
- **Time charts:** show actual vs predicted bikes from testing data set

## 6) Test Plan
- **Train/test split by date:** Train on data collected between January 2022 - December 2024. Test on data collected beginning in January 2025. Approximately 75% training, 25% test.
- **Metrics:** average error (MAE) and RMSE for numbers; for warnings, track how often we are right and how often we miss a problem.  
- **Compare with baselines:** make sure we improve on “last value” and “hour‑of‑week average.”  
- **Small experiments:** remove weather or recent‑history features to see how much they help.

## 7) Repository Layout (proposed)
bluebikes-forecast/
  README.md
  flask/
    app.py
    requirement.txt
    model.joblib
    bike_multi_xgb_model.joblib
    simulate_model.py
    test.py
    testagain.py
  nextjs/
    app/
      api/
        bikes/
          route.ts
        citibike/
          route.ts
        predict/
          route.ts
        weather/
          route.ts
      map/
        page.tsx
      layout.tsx
      globals.css
      page.tsx
    components/
      bike-map.tsx
      bike-station-card.tsx
      ui/
        badge.tsx
        button.tsx
        card.tsx
        loading-spinner.tsx
        time-slider.tsx
    lib/
      types.ts
      utils.ts
    public/
    README_BIKES.md
    README.md
    package.json
    package-lock.json
    tsconfig.json
    tailwind.config.ts
    next.config.ts

## 8) References (to cite in the report)
- Bluebikes System Data page; GBFS feed links and station list information.  
- GBFS specification (station_information capacity; station_status availability).  
- OpenWeather API docs for hourly and historical data (if used).

> We will add exact URLs and data license text in the final report README once the repo is created.

## PS
All in all, this experience has been extremely valuable for us, and we sincerely thank the DS+X Hackathon organizers for their strong support.

