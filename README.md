# DS + X Hackathon - Bluebikes Demand Forecasting

**Team Name:** Team MLKJ  
**Team:** Matthew Yan · Jiayong Tu · Lingjie Su · Kunyu Zheng  
**Demo Link:** https://mlkj.vercel.app/  

---

### Overall Summary
* **What we’re building:** A real-time web app that predicts **bike and dock availability at each Bluebikes station in the next 60 minutes**, powered by live data and a lightweight ML model.
* **Why it helps:** Riders can plan trips more efficiently, and organizers can instantly identify high-demand or low-availability stations.
* **Data we’ll use:** Bluebikes’ **live station status API**, **station capacity data**, and **recent trip history** (sampled for quick training).
* **How we’ll judge success:** Our system will be successful if the map updates in real time, the model predictions are reasonably close to reality, and the interface clearly shows where shortages are likely to occur.
* **Timeline:** **30 hours total** — focusing on building an end-to-end working demo: live data ingestion, on-the-fly prediction, and interactive visualization.

## 1) Project Description
We will build a real-time **bike availability prediction and visualization system** for Bluebikes stations in Boston. Using Bluebikes’ **public live API** together with recent trip history, our project will **forecast the number of available bikes and docks at each station in the next hour**. The web app will display a **live interactive map** that shows current and predicted availability, allowing users and city planners to spot potential shortages in advance.
</br>Since this is a 30-hour hackathon project, our focus is on creating a **fully functional demo** — integrating real-time data, lightweight machine-learning predictions, and clear visual insights — rather than long-term modeling or large-scale optimization.

### Goals
- **Prediction:** Predict, for any station *s* at future time *t*, the number of available bikes and docks.

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

### How we measure success:
- Keep **average error ≈ 3 bikes** and **typical squared error ≈ 5 bikes RMSE** on the top ~50 stations.
- Risk warnings should be **right ~80%+ of the time** (we’ll tune thresholds on a validation set).
- Beat simple baselines: “use last hour” and “use the average for this hour of the week.”

## 3) Data to Collect & How
### Trip history
- **What:** start/end time, start/end station, rider type (member/casual), trip duration.
- **Why:** Data used to identify bike usage patterns at different locations and times.
- **Where:** [Bluebikes website (monthly data)](https://s3.amazonaws.com/hubway-data/index.html).
- **Station selection criteria**
  - We will focus modeling/evaluation on a fixed **Top-50 busiest stations** to ensure stable signals:
  - Rank by monthly total trips (starts + ends) during the training period.
  - Ensure geographic diversity (e.g., downtown, campus areas, residential neighborhoods).
  - Keep the set fixed for test to avoid selection leakage.

### 3.2 Weather
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
- **Interactive Map Visualization:** Use an interactive map component (Leaflet) to display the predicted bike availability at all Bluebikes stations. Each station will be represented by color and/or marker size corresponding to the predicted number of available bikes. The map will support zooming, panning, and tooltip interaction for detailed station-level insights.

## 6) Test Plan
- **Train/test split by date:** Train on data collected between January 2022 - December 2024. Test on data collected beginning in January 2025. Approximately 75% training, 25% test.
- **Metrics:** average error (MAE) and RMSE for numbers; for warnings, track how often we are right and how often we miss a problem.  
- **Compare with baselines:** make sure we improve on “last value” and “hour‑of‑week average.”  
- **Small experiments:** remove weather or recent‑history features to see how much they help.

## 7) Repository Layout
DS-X-bluebikes-demand-forecast/
  README.md
  data/
    weather.dta  （Stata data file）
  flask/
    app.py
    requirement.txt
    simulate_model.py
    test.py
    testagain.py
  pipeline/
    train_model.py
    data_clean.do  （Stata pipeline script）
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
      globals.css
      layout.tsx
      map/
        page.tsx
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
    next.config.ts
    package-lock.json
    package.json
    postcss.config.mjs
    README_BIKES.md
    README.md
    tailwind.config.ts
    tsconfig.json

## 8) References
- Bluebikes System Data — Official Bluebikes open data portal, including GBFS feed links and station list metadata.
- GBFS Specification — General Bikeshare Feed Specification, covering station_information (capacity) and station_status (availability) fields.
- Open-Meteo API Documentation — Open-source weather API providing hourly and historical weather data used for environmental feature integration.
- NOAA National Centers for Environmental Information (NCEI) — Official U.S. government database providing historical weather records, including wind speed, temperature, and precipitation data for the Boston area.

## PS
All in all, this experience has been extremely valuable for us, and we sincerely thank the DS+X Hackathon organizers for their strong support.

