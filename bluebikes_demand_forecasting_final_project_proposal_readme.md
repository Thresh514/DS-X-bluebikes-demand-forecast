# Bluebikes Demand Forecasting — Final Project Proposal

**Team:** Matthew Yan · Jiayong Tu · Fenglin Hu · Mingyu Shen  
**Course:** CS 506  
**Repo:** _<add GitHub URL here before submitting>_

---

### Plain-language Summary
- **What we’re building:** A simple tool that tells you, for any station, what bike/dock availability will look like in the **next 60 minutes** and warns you if a station is likely to run out of bikes or docks. We’ll also compare how **members** and **casual riders** use the system.
- **Why it helps:** Riders can pick a better station before they arrive; organizers get a quick view of hot spots and risk.
- **Data we’ll use:** Trip history CSVs from Bluebikes, a station list with capacity, the **live station status feed** (we’ll save a copy every 5 minutes), and optional weather.
- **How we’ll judge success:** We’ll train on earlier dates and test on later ones. We aim for an **average error around 3 bikes** and risk warnings that are **right most of the time (~80%+)**. We must beat simple rules like “use last hour” or “use the average for this hour of the week.”
- **Timeline (12 weeks):**
  - **W1–2** set up data collection and cleaning;
  - **W3–4** first features and baseline models; first map prototype;
  - **W5–6** better models, risk warnings, and member vs casual charts;
  - **W7** backtesting and error review;
  - **W8–11** iterate and polish;
  - **W12** final demo and report.
- **Main risks:** No full history of live availability → we **save our own feed** during the project. Sudden truck rebalancing → we mark big jumps and rely on **risk warnings** when exact counts are noisy.

## 1) Project Description
We will use Bluebikes’ public data to study demand **by station and time** and to **predict near‑term availability** (bikes and docks). We will also compare **members vs casual riders** to see when and where they ride, and how long their trips are. The scope fits a 12‑week student project with a simple baseline, steady improvements, and a small interactive demo.

### Problem statements
- **Prediction:** For a station *s* at time *t*, estimate bikes and docks **one hour ahead**, or the **chance** the station runs out of bikes/docks in that hour.
- **Behavior:** Compare members vs casual riders by hour of day, weekday/weekend, popular stations, and trip length.

### What we’re **not** doing
- Long‑range forecasts beyond a day.
- Full city rebalancing/operations optimization.

### Why it matters
- Riders can avoid empty or full stations before they get there.
- Planners can spot problem stations and times and act earlier.

## 2) Goals & Success Criteria
**G1. Short‑term station forecasts.** Hourly (or 15‑min) forecasts for the next 60 minutes.  
**G2. Clear risk warnings.** Simple “likely to run out / likely to be full” signals for busy stations.  
**G3. Easy‑to‑read insights.** Straightforward charts comparing members vs casual riders.  
**G4. Usable demo.** A small interactive map + charts that non‑technical users can read.

**How we measure success:**
- Keep **average error ≈ 3 bikes** and **typical squared error ≈ 5 bikes RMSE** on the top ~50 stations.
- Risk warnings should be **right ~80%+ of the time** (we’ll tune thresholds on a validation set).
- Beat simple baselines: “use last hour” and “use the average for this hour of the week.”

## 3) Data to Collect & How
### 3.1 Trip history (CSV)
- **Where:** Bluebikes website (monthly/quarterly ZIP/CSV).  
- **What:** start/end time, start/end station, rider type (member/casual), trip duration.  
- **Why:** Build station‑level counts per time block and analyze rider behavior.

### 3.2 Station list
- **What:** station ID, name, latitude/longitude, **capacity (number of docks)**.  
- **Why:** Join with trips; cap predictions by capacity; add simple location features.

### 3.3 Live station status feed
- **What:** current bikes and docks available, whether the station allows renting/returning, last update time.  
- **Plan:** Save a snapshot **every 5 minutes** during the project. These snapshots become our ground truth for recent weeks and power the live demo.

> Historical live availability is not published. For older months we will approximate with trip inflow/outflow and capacity; for the project window we rely on our **own saved snapshots**.

### 3.4 Weather (optional)
- **What:** hourly temperature, rain/snow, wind, general condition.  
- **Why:** Weather strongly affects bike use.

### 3.5 Data use & privacy
- Data are aggregated; there is no personal information. We follow the site’s data terms.

## 4) Data Processing Plan
- **Time blocks:** Use hourly buckets (and compare with 15‑min if helpful).  
- **Stations:** Use station IDs; handle renames/moves; ignore stations with very little data.  
- **From trips to features:** For each station and hour, compute **starts**, **ends**, **net change (ends − starts)**, recent averages and changes, hour‑of‑week, weekend/holiday flags.  
- **Join capacity** and **our saved status snapshots** for labels.  
- **Join weather** by time.

## 5) How We’ll Make Predictions
### Targets
- **Numbers:** bikes (and/or docks) **one hour ahead** for each station.  
- **Warnings:** chance of **running out** of bikes or docks within the next hour.

### Start with simple baselines
1) **Last value** (assume next hour ≈ this hour).  
2) **Average for this hour of the week** (captures daily/weekly patterns).  
3) *(Optional)* A simple time‑series model on single stations.

### Main models
- **Simple regression** and **tree‑based models** (e.g., random forest or gradient boosting). We’ll keep them small and use early‑stopping to avoid overfitting.

### Features we’ll use
- Recent values and changes; hour‑of‑week; weekend/holiday.  
- Station capacity and simple popularity rank.  
- Weather (if included).  
- A flag for sudden jumps (likely truck rebalancing).

### Model checks
- Use time‑ordered validation; don’t use any future information when training.  
- Keep models readable; add short notes explaining which features mattered most.

## 6) Visualization Plan
- **Interactive map:** color/size by predicted bikes or by risk; hover to see recent trend.  
- **Time charts:** show actual vs predicted bikes; show typical error.  
- **Member vs casual:** simple heatmaps and bar charts by hour and location.  
- **Demo app:** a small Streamlit (or similar) app to click a station and see its forecast and risk.

## 7) Test Plan
- **Train/test split by date:** Train on earlier dates; test on later dates. No shuffling.  
- **Metrics:** average error (MAE) and RMSE for numbers; for warnings, track how often we are right and how often we miss a problem.  
- **Compare with baselines:** make sure we improve on “last value” and “hour‑of‑week average.”  
- **Small experiments:** remove weather or recent‑history features to see how much they help.  
- **No data leakage:** features only use information from **now or earlier**.

## 8) Project Timeline (12 weeks)

* **W1–W2**: Literature & EDA; implement data ingesters (trips, station list, GBFS logger, weather); define schemas.
* **W3–W4**: Feature engineering; baselines + first tree model; build prototype dashboard.
* **W5–W6**: Model tuning; add risk classifier; member vs. casual analysis; refine visuals.
* **W7**: Backtesting, error analysis, robustness & calibration; writeup.
* **W8–W11**: Iterations, additional backtesting, UI polish, user feedback, and integration; prepare presentation outline.
* **W12**: Final polishing; presentation & README.

---

## 9) Deliverables
- **Cleaned datasets** (documented tables for features/labels).  
- **Reproducible notebooks/scripts** for ingestion, features, training, and evaluation.  
- **Interactive visualization** (map + time‑series).  
- **Final report** with methods, results, and limitations.

---

## 10) Risks & Mitigations
- **Label availability**: historical station availability is not archived → **Mitigation**: (a) approximate with trips + capacity for past months; (b) run our **GBFS logger** during the project to create labels for recent weeks.  
- **Concept drift/seasonality**: demand varies with weather and semester schedules → add weather and calendar features; evaluate by month.  
- **Rebalancing noise**: truck rebalancing shifts inventory → detect jump anomalies and include as feature; evaluate classification (risk) which is less sensitive to exact counts.  
- **Scope creep**: limit to **top 50 busiest stations** and **1‑hour horizon**.

---

## 11) Team Roles (initial)
- **Data ingestion & engineering**: Jiayong Tu, Fenglin Hu  
- **Modeling & evaluation**: Matthew Yan, Mingyu Shen  
- **Visualization & report**: all members, with code review rotations

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
- Bluebikes System Data page; GBFS feed links and station list information.  
- GBFS specification (station_information capacity; station_status availability).  
- OpenWeather API docs for hourly and historical data (if used).

> We will add exact URLs and data license text in the final report README once the repo is created.


---

## 14) Similar Products / Related Work (brief)
- Public bikeshare dashboards typically report **current** status and historical utilization summaries.
- Our proposal adds **forward-looking forecasts** + **risk classification** and a focused **member vs. casual** behavioral study, filling a practical gap for short-window planning.

---

## 15) Data Quality Checks & QA
- **Timestamps make sense:** start ≤ end; times in UTC; Boston time handled correctly.  
- **Stations are valid:** IDs exist; renamed/relocated stations mapped correctly.  
- **Duplicates/outliers:** drop exact duplicates; flag extreme trip times; sanity‑check speeds.  
- **Live status is fresh:** “last updated” is recent; mark stale snapshots.  
- **Capacity rule holds:** bikes + docks ≤ capacity (allow a small margin for reporting lag).  
- **Basic tests:** small unit tests for parsers and feature builders; one end‑to‑end smoke test.

---

## 16) Reproducibility & Engineering
- **Setup:** a `requirements.txt` and short setup steps.  
- **Config:** `.env.example` for any keys; never commit secrets.  
- **Repeatability:** fix random seeds where possible; note any non‑determinism.  
- **Make it easy to run:** simple commands like `make ingest`, `make features`, `make train`, `make eval`.  
- **Code style:** basic lint/format; short docstrings.

---

## 17) Evaluation Protocol (simple)
- **Horizon:** 60 minutes ahead; hourly buckets.  
- **Validation:** a few rolling checks across months, then a final last‑month holdout.  
- **Reports:** per‑station errors, simple charts by hour, weekday/weekend, and weather bins.  
- **Risk thresholds:** choose on the validation set; show Low/Medium/High bands in the UI.

---

## 18) Station Selection Criteria
We will focus modeling/evaluation on a fixed **Top-50 busiest stations** to ensure stable signals:
- Rank by monthly total trips (starts + ends) during the training period.
- Ensure geographic diversity (e.g., downtown, campus areas, residential neighborhoods).
- Keep the set fixed for test to avoid selection leakage.

---

## 19) Milestones with DRIs (owners)
- **W1** (DRI: Jiayong): Trip CSV ingestion + station list; timezone normalization; initial EDA notebook.
- **W2** (DRI: Fenglin): GBFS logger running (5-min cadence), weather fetcher; data-quality checks in place.
- **W3** (DRI: Matthew): Feature builder (lags/rolling/hour-of-week/capacity); baseline models (persistence, HoW mean).
- **W4** (DRI: Mingyu): First tree model (XGBoost/LightGBM); preliminary dashboard (map + time-series panel).
- **W5** (DRI: Matthew): Risk classifier; calibration evaluation; add rebalancing-indicator feature.
- **W6** (DRI: Fenglin): Backtesting harness + ablations; member vs casual analysis visuals.
- **W7** (DRI: Jiayong): Error analysis; polish visuals; write results.
- **W8–W11** (All): Iterations, robustness checks, UI polish, and feedback incorporation.
- **W12** (All): Final polish; README/report; demo script.

---

## 20) Stretch Goals (nice-to-have)
- **15-min horizon** forecasts and uncertainty intervals (quantile regression).
- **Global sequence model** (temporal conv or simple RNN) trained across stations.
- **Counterfactual what-if** sliders in the dashboard (e.g., weather toggles).
- **Minimal rebalancing signal** from status jumps (unsupervised change-point detection).

---

## 21) Dashboard User Stories (for demo)
- **Commuter**: “At 8:15 AM, will **BU Central** have bikes at 8:45? If high stockout risk, suggest nearest alternative.”
- **Casual rider**: “On a rainy Saturday, which stations near the Boston Common are likely to have docks free at 4 PM?”
- **Analyst**: “Show top-10 stations by forecast error last week and their calibration curves.”

---

## 22) Appendices
### A. Minimal Data Dictionary (initial)
- **Trips CSV**: `ride_id`, `started_at` (UTC), `ended_at` (UTC), `start_station_id`, `end_station_id`, `member_casual`, `duration_min`.
- **Station information**: `station_id`, `name`, `lat`, `lon`, `capacity`, `region`.
- **Station status snapshot**: `timestamp_utc`, `station_id`, `num_bikes_available`, `num_docks_available`, `is_renting`, `is_returning`, `last_reported_utc`.
- **Weather hourly**: `timestamp_utc`, `temp_c`, `precip_mm`, `wind_mps`, `condition_code`.

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
- **Train**: first 70% of timeline (by timestamp).
- **Val**: next 15% (for model selection & early stopping).
- **Test**: final 15% (untouched until last week).
- **Rolling windows**: monthly backtests across the GBFS logging period.

### D. Risk Thresholding
- Choose threshold by maximizing **F1** or using **Youden’s J** on validation; verify calibration; present risk bands (Low/Medium/High) in the UI.

### E. Repo Checklists
- `README` quickstart; `make` targets; `.env.example`; data paths; figures saved under `reports/`.
- CI (optional): run unit tests and lint on PRs.

