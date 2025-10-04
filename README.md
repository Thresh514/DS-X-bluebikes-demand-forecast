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
- Long‑range forecasts beyond a day.
- Full city rebalancing/operations optimization.

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

* **Linear regression:** interpretable baseline to capture simple trends.
* **Tree-based models:** Random Forest or Gradient Boosting (e.g., XGBoost/LightGBM) to capture nonlinear interactions.
  All models will use **time-ordered train/test splits** and **early stopping** to prevent overfitting.

### Features

* Recent lagged values (e.g., available bikes in past 15, 30, 60 min)
* Hour-of-week, weekend/holiday indicators
* Station capacity and popularity rank
* Weather features (temperature, precipitation, wind, condition)

### Model Evaluation & Checks

* Compare model performance against the persistence baseline using MAE and RMSE.
* Ensure **no future data leakage** by using chronological splits.
* Analyze **feature importance** to explain which factors drive predictions.
  

## 5) Visualization Plan
- **Interactive heat map:** display prediction of bike availability of all bluebike stops on a map through different color/size based on each location's predicted availability
- **Time charts:** show actual vs predicted bikes from testing data set

## 6) Test Plan
- **Train/test split by date:** Train on data collected between January 2022 - December 2024. Test on data collected beginning in January 2025. Approximately 75% training, 25% test.
- **Metrics:** average error (MAE) and RMSE for numbers; for warnings, track how often we are right and how often we miss a problem.  
- **Compare with baselines:** make sure we improve on “last value” and “hour‑of‑week average.”  
- **Small experiments:** remove weather or recent‑history features to see how much they help.

## 7) Project Timeline (8 weeks)
* **W1**: Implement data ingesters (trips, station list, GBFS logger, weather); define schemas.
* **W2**: Feature engineering; baselines + first tree model; build prototype dashboard.
* **W3–W4**: Model tuning; add risk classifier; member vs. casual analysis; refine visuals.
* **W5**: Backtesting, error analysis, robustness & calibration.
* **W6–W7**: Iterations, additional backtesting, prepare presentation.
* **W8**: Final polishing for presentation & README.

## 8) Deliverables
- **Cleaned datasets** (documented tables for features/labels).  
- **Reproducible notebooks/scripts** for ingestion, features, training, and evaluation.  
- **Final presentation** with methods, results, and limitations.

## 9) Risks & Mitigations
- **Concept drift/seasonality**: demand varies with weather and semester schedules → add weather and calendar features; evaluate by month.  
- **Rebalancing noise**: truck rebalancing shifts inventory → detect jump anomalies and include as feature; evaluate classification (risk) which is less sensitive to exact counts.  
- **Scope creep**: limit to **top 50 busiest stations** and **1‑hour horizon**.

## 10) Stretch Goals (nice-to-have)
- **Application:** Fullstack applicaiton utilizing our trained model.
- **15-min horizon** forecasts and uncertainty intervals (quantile regression).

## 11) Repository Layout (proposed)
bluebikes-forecast/
  README.md
  data/
    raw/              # trip CSVs, station list, weather pulls
    gbfs_logs/        # station_status snapshots (our own archive)
    processed/        # feature/label tables
  src/
    ingest/
      download_trips.py
      fetch_station_info.py
      gbfs_logger.py
      fetch_weather.py
    features/
      build_datasets.py
    models/
      train_regression.py
      train_classifier.py
    viz/
      dashboard_app.py
  notebooks/
    01_eda.ipynb
    02_feature_checks.ipynb
    03_model_baselines.ipynb
  LICENSE

## 12) Team Roles (initial)
- **Data ingestion & engineering**: Jiayong Tu, Fenglin Hu  
- **Modeling & evaluation**: Matthew Yan, Mingyu Shen  
- **Visualization & report**: all members, with code review rotations

## 13) References (to cite in the report)
- Bluebikes System Data page; GBFS feed links and station list information.  
- GBFS specification (station_information capacity; station_status availability).  
- OpenWeather API docs for hourly and historical data (if used).

> We will add exact URLs and data license text in the final report README once the repo is created.

