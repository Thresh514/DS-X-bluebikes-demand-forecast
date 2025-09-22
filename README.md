# Bluebikes Demand Forecasting — Final Project Proposal

**Team:** Matthew Yan · Jiayong Tu · Fenglin Hu · Mingyu Shen<br>
**Course:** CS 506<br>
**Repo:** *https://github.com/MattFromBeijing/bluebikes-demand-forecast*

---

## 1) Project Description

We will use **Bluebikes** (Boston’s bikeshare system) open trip history and real‑time system feeds to analyze spatiotemporal demand at stations and to **forecast short‑horizon bike availability / empty docks**. We will also compare behavioral patterns between **members vs. casual riders** to understand how usage differs by hour, location, and seasonality. The scope is designed for \~8 weeks of work with a clear baseline, incremental modeling, and a visual demo.

### Problem statements

* **Forecasting**: Given a station *s* and time *t*, predict the *next 60‑minute* trajectory of:

  * `num_bikes_available` and/or `num_docks_available`, or
  * Probability of **stockout** (0 bikes) or **dockout** (0 empty docks) within the next hour.
* **Behavior analysis**: Quantify differences in origin/destination patterns, time‑of‑day, trip durations, and weekend/weekday dynamics for **members vs. casual** users.

### Non‑goals (to keep scope realistic)

* Multi‑day or multi‑week long‑range forecasts (beyond 24h).
* Citywide fleet rebalancing optimization.

---

## 2) Goals & Success Criteria

**G1. Demand Forecasting.** Provide hourly (or 15‑min) forecasts per station for the next 60 minutes.
**G2. Risk Alerts.** Classify stockout/dockout risk for selected busy stations.
**G3. Behavior Insights.** Produce clear, statistically grounded comparisons of members vs. casual riders.
**G4. Usability.** Deliver an interactive visualization (map + charts) that a non‑technical audience can use.

**Quantitative targets (success metrics):**

* Regression targets: **MAE ≤ 3 bikes** and **RMSE ≤ 5 bikes** on held‑out test periods at top 50 stations.
* Classification targets: **AUC ≥ 0.80** for stockout/dockout risk; **Brier score** tracked for calibration.
* Baselines we must beat: hour‑of‑week historical average; naïve persistence ("value at t = value at t‑1").

---

## 3) Data to Collect & How

### 3.1 Trip histories (quarterly CSV)

* **Source:** Bluebikes System Data page → quarterly trip history ZIP/CSV.
* **Fields (subset):** start/end time, start/end station name & ID, user type (member/casual), trip duration.
* **Use:** Construct **inflow/outflow** counts by station and time bucket (15‑min or hourly); analyze behavior.

### 3.2 Station metadata

* **Station list:** station ID, name, lat/lon, **capacity (total docks)**.
* **Use:** Join to trips, derive features (capacity, region, proximity to T stops/campuses), and cap forecasts.

### 3.3 Real‑time GBFS feeds (for labels & live demo)

* **Feeds:** `station_information.json` (capacity, location) and `station_status.json` (# bikes/docks available, is\_renting, is\_returning, last\_reported).
* **Plan:** Implement a lightweight **collector** that snapshots `station_status` at **5‑minute** cadence during the project period to build supervised labels for availability and to power a small live demo. We will align snapshots to our time buckets.

> **Note:** Historical availability is not provided directly; we will (a) approximate from trips for past months (net inflow/outflow with capacity constraints), and (b) use our **own GBFS archive** during the 8‑week window for ground‑truth labels and evaluation.

### 3.4 Weather features (optional but recommended)

* **Hourly weather:** temperature, precipitation, wind, weather condition.
* **Use:** Feature inputs to capture demand sensitivity to weather.

### 3.5 Data license & ethics

* Respect Bluebikes’ data license; no personal data are present. All results are aggregated at station/time level.

---

## 4) Data Processing Plan

* **Time bucketing:** 15‑minute and hourly resolutions; we will choose one primary (likely hourly) to reduce noise.
* **Spatial normalization:** Station ID as key; handle station renames/moves; filter stations added/removed mid‑period.
* **Trip → demand features:** For each station/time bucket: `starts`, `ends`, `net_flow = ends − starts`, `rolling_mean(net_flow, k)`, `rolling_std`, **lagged features** (t‑1, t‑2, …, t‑4), hour‑of‑week one‑hot, holiday/weekend flags.
* **Join station capacity** (total docks) and **status snapshots** (labels for availability).
* **Weather join:** spatial join to Boston area; align by timestamp.

---

## 5) Modeling Plan

### Targets

* **Regression:** `num_bikes_available` (and/or `num_docks_available`) at *t + 60 min* per station.
* **Classification:** Probability of **stockout** / **dockout** within next 60 minutes.

### Baselines

1. **Persistence** (value at t as forecast for t+1).
2. **Hour‑of‑Week Mean** (seasonal average per station & hour‑of‑week).
3. **ARIMA/Prophet** on per‑station series (optional quick check).

### Candidate models

* **Linear models** with regularization (Ridge/Lasso, Poisson/Quasi‑Poisson for counts).
* **Tree ensembles:** Random Forest, **XGBoost/LightGBM** (strong tabular baselines).
* **Gradient boosting with monotonicity/interaction constraints** (to control overfitting).
* **(Stretch)** Global sequence model (e.g., LightGBM with lag stacks; simple RNN/Temporal Convolution) if time permits.

### Feature set (initial)

* Lagged availability and **net\_flow** features, rolling stats.
* **Hour‑of‑week**, weekend/holiday, month.
* **Capacity**, region/municipality, station popularity rank.
* **Weather**: temp, precipitation, wind, condition code.
* **Balancing indicator**: sudden jumps in availability not explainable by trips (proxy for truck rebalancing).

### Regularization & validation

* **Temporal CV** with rolling origin; consistent station splits to avoid leakage.
* Early stopping, max\_depth constraints; permutation‑importance checks; SHAP for interpretability (if used locally).

---

## 6) Visualization Plan

* **Interactive map** (Leaflet/Mapbox/Kepler.gl): circle color/size by predicted bikes (or risk) per station, with tooltips for recent trend.
* **Time‑series panel**: actual vs. predicted availability; residual plot; calibration curve for risk model.
* **Member vs. casual**: heatmaps by hour‑of‑week and municipality; OD flow chords between top station pairs.
* **Dashboard**: small web app (Streamlit/Dash or a static notebook with interactive widgets) for demo.

---

## 7) Test Plan

* **Holdout strategy:** Strict **time‑based split** (no shuffling). Example: train on first 70% of timeline; validate on next 15%; final test on last 15%. Additionally, **rolling‑window backtests** over multiple contiguous months.
* **Metrics:** MAE, RMSE, **SMAPE**, and classification metrics (AUC, PR‑AUC, Brier). Report per‑station metrics and macro averages.
* **Ablations:** Without weather; without lagged features; station capacity as cap vs. unconstrained.
* **Leakage controls:** No use of future information; features only from ≤ t.

---

## 8) Project Timeline (8 weeks)

* **W1–W2**: Literature & EDA; implement data ingesters (trips, station list, GBFS logger, weather); define schemas.
* **W3–W4**: Feature engineering; baselines + first tree model; build prototype dashboard.
* **W5–W6**: Model tuning; add risk classifier; member vs. casual analysis; refine visuals.
* **W7**: Backtesting, error analysis, robustness & calibration; writeup.
* **W8**: Final polishing; presentation & README.

---

## 9) Deliverables

* **Cleaned datasets** (documented tables for features/labels).
* **Reproducible notebooks/scripts** for ingestion, features, training, and evaluation.
* **Interactive visualization** (map + time‑series).
* **Final report** with methods, results, and limitations.

---

## 10) Risks & Mitigations

* **Label availability**: historical station availability is not archived → **Mitigation**: (a) approximate with trips + capacity for past months; (b) run our **GBFS logger** during the project to create labels for recent weeks.
* **Concept drift/seasonality**: demand varies with weather and semester schedules → add weather and calendar features; evaluate by month.
* **Rebalancing noise**: truck rebalancing shifts inventory → detect jump anomalies and include as feature; evaluate classification (risk) which is less sensitive to exact counts.
* **Scope creep**: limit to **top 50 busiest stations** and **1‑hour horizon**.

---

## 11) Team Roles (initial)

* **Data ingestion & engineering**: Jiayong Tu, Fenglin Hu
* **Modeling & evaluation**: Matthew Yan, Mingyu Shen
* **Visualization & report**: all members, with code review rotations

---

## 12) Repository Layout (proposed)

```
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
```

---

## 13) References (to cite in the report)

* Bluebikes System Data page; GBFS feed links and station list information.
* GBFS specification (station\_information capacity; station\_status availability).
* OpenWeather API docs for hourly and historical data (if used).

> We will add exact URLs and data license text in the final report README once the repo is created.
