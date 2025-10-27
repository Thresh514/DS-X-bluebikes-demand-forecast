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
