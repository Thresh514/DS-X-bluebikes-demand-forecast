# Bluebikes Demand Forecasting — Final Project Proposal

**Team:** Matthew Yan · Jiayong Tu · Fenglin Hu · Mingyu Shen <br/>
**Course:** CS 506 <br/>
**Repo: **https://github.com/MattFromBeijing/bluebikes-demand-forecast**

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

### Why this is novel / useful (vs. existing dashboards)

* **Prediction, not just status**: Official maps show current availability; we add **short-horizon forecasts** and **risk of stockout/dockout**, enabling proactive decisions (e.g., walk to a nearby station before it empties).
* **Actionable risk framing**: Binary risk alerts are easier for non-technical users than raw counts; we will provide **calibrated probabilities** with reliability plots.
* **User-type insights**: A focused **member vs. casual** analysis (hour-of-week, OD pairs, durations) is rarely available in existing public dashboards.
* **Lightweight, reproducible stack**: All data and code paths are scripted and documented; results are reproducible on student laptops.

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

---

## 14) Similar Products / Related Work (brief)

* Public bikeshare dashboards typically report **current** status and historical utilization summaries.
* Our proposal adds **forward-looking forecasts** + **risk classification** and a focused **member vs. casual** behavioral study, filling a practical gap for short-window planning.

---

## 15) Data Quality Checks & QA

We will build a small but strict QA suite to avoid silent data issues:

* **Schema checks** (Great Expectations or custom): required columns present; dtypes (timestamps, IDs, enums) validated.
* **Time sanity**: `start_time <= end_time`; non-negative durations; timezone normalized to **UTC** with explicit Boston **EDT/EST** handling.
* **Station integrity**: unknown station IDs flagged; renamed/relocated stations resolved with a mapping table.
* **Duplicate trips & outliers**: drop exact dupes; winsorize top 0.5% durations; flag improbable speeds.
* **GBFS freshness**: `now - last_reported` within tolerance (e.g., < 10 min) or mark snapshot as stale.
* **Capacity consistency**: `num_bikes_available + num_docks_available <= capacity` (allow small tolerance for reporting lag).
* **Unit tests** for parsers, feature builders, and splitters; **smoke tests** for end-to-end pipelines.

---

## 16) Reproducibility & Engineering Standards

* **Env**: `requirements.txt` (or `environment.yml`), pinned versions; `python -m venv` instructions.
* **Randomness**: global seeds; document any non-determinism (e.g., multithreaded training).
* **Makefile** / simple CLI: `make ingest`, `make features`, `make train`, `make eval`, `make viz`.
* **Data versioning**: folder conventions with checksums; optional DVC if time permits.
* **Pre-commit**: black/ruff/isort; type hints where helpful.
* **Security/ethics**: no secrets in repo; API keys via `.env`.

---

## 17) Evaluation Protocol (detailed)

* **Horizon**: 60-minute ahead point forecast; (stretch) also 15-min horizon.
* **Granularity**: per-station, hourly buckets.
* **Splits**: rolling-origin backtests over contiguous monthly windows; final **chronological holdout** at the end of the GBFS logging period.
* **Metrics**:

  * Regression: MAE, RMSE, SMAPE; report **macro (per-station) averages** and **station histograms**.
  * Classification: ROC-AUC, PR-AUC, **Brier score**; **calibration curves** and **decision curves**.
* **Baselines**: persistence; hour-of-week mean; (optional) simple ARIMA per-station.
* **Ablations**: −weather; −lags; capacity cap off; exclude rebalancing-indicator.
* **Error analysis**: by hour-of-day, weekday vs weekend, weather bins, station capacity quintiles.

---

## 18) Station Selection Criteria

We will focus modeling/evaluation on a fixed **Top-50 busiest stations** to ensure stable signals:

* Rank by monthly total trips (starts + ends) during the training period.
* Ensure geographic diversity (e.g., downtown, campus areas, residential neighborhoods).
* Keep the set fixed for test to avoid selection leakage.

---

## 19) Milestones with DRIs (owners)

* **W1** (DRI: Jiayong): Trip CSV ingestion + station list; timezone normalization; initial EDA notebook.
* **W2** (DRI: Fenglin): GBFS logger running (5-min cadence), weather fetcher; data-quality checks in place.
* **W3** (DRI: Matthew): Feature builder (lags/rolling/hour-of-week/capacity); baseline models (persistence, HoW mean).
* **W4** (DRI: Mingyu): First tree model (XGBoost/LightGBM); preliminary dashboard (map + time-series panel).
* **W5** (DRI: Matthew): Risk classifier; calibration evaluation; add rebalancing-indicator feature.
* **W6** (DRI: Fenglin): Backtesting harness + ablations; member vs casual analysis visuals.
* **W7** (DRI: Jiayong): Error analysis; polish visuals; write results.
* **W8** (All): Final polish; README/report; demo script.

---

## 20) Stretch Goals (nice-to-have)

* **15-min horizon** forecasts and uncertainty intervals (quantile regression).
* **Global sequence model** (temporal conv or simple RNN) trained across stations.
* **Counterfactual what-if** sliders in the dashboard (e.g., weather toggles).
* **Minimal rebalancing signal** from status jumps (unsupervised change-point detection).

---

## 21) Dashboard User Stories (for demo)

* **Commuter**: “At 8:15 AM, will **BU Central** have bikes at 8:45? If high stockout risk, suggest nearest alternative.”
* **Casual rider**: “On a rainy Saturday, which stations near the Boston Common are likely to have docks free at 4 PM?”
* **Analyst**: “Show top-10 stations by forecast error last week and their calibration curves.”

---

## 22) Appendices

### A. Minimal Data Dictionary (initial)

* **Trips CSV**: `ride_id`, `started_at` (UTC), `ended_at` (UTC), `start_station_id`, `end_station_id`, `member_casual`, `duration_min`.
* **Station information**: `station_id`, `name`, `lat`, `lon`, `capacity`, `region`.
* **Station status snapshot**: `timestamp_utc`, `station_id`, `num_bikes_available`, `num_docks_available`, `is_renting`, `is_returning`, `last_reported_utc`.
* **Weather hourly**: `timestamp_utc`, `temp_c`, `precip_mm`, `wind_mps`, `condition_code`.

### B. GBFS Logger (pseudocode)

```python
# run every 5 minutes via cron/systemd timer
import requests, time, json, datetime as dt
from pathlib import Path

URL = "<station_status.json>"  # to be set in .env
OUT = Path("data/gbfs_logs/")
OUT.mkdir(parents=True, exist_ok=True)

def fetch_status():
    r = requests.get(URL, timeout=10)
    r.raise_for_status()
    payload = r.json()
    ts = dt.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    (OUT / f"status_{ts}.json").write_text(json.dumps(payload))

if __name__ == "__main__":
    fetch_status()
```

### C. Train/Val/Test Split (example)

* **Train**: first 70% of timeline (by timestamp).
* **Val**: next 15% (for model selection & early stopping).
* **Test**: final 15% (untouched until last week).
* **Rolling windows**: monthly backtests across the GBFS logging period.

### D. Risk Thresholding

* Choose threshold by maximizing **F1** or using **Youden’s J** on validation; verify calibration; present risk bands (Low/Medium/High) in the UI.
