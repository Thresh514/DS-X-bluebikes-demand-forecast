# Bluebikes Demand Forecasting - Demo Script (2 minutes)

## Introduction (15 seconds)
"Hi, today I'll show you our Bluebikes Demand Forecasting project. We built a system that predicts how many bikes will be available at each station in the future. This helps riders find bikes and helps operators plan bike redistribution."

---

## Part 1: Homepage Overview (20 seconds)
*[Navigate to homepage]*

"Here's our website homepage. You can see three main features:
- **Real-time Data**: Current Bluebikes usage
- **Demand Forecasting**: Predictions using machine learning
- **Model Results**: Visualizations of our models

Let me show you the visualizations first."

---

## Part 2: Data Exploration Visualizations (35 seconds)
*[Navigate to /visualizations, scroll to Data Exploration section]*

"First, let's look at what we learned from the data.

**Global Distribution**: This shows how bike usage varies across all stations. You can see most stations have low activity, with some very busy stations.

**Station Distributions**: Here are 20 of the busiest stations. Each has two charts:
- Distribution chart: Shows when bikes arrive and leave throughout the day
- Rush hours chart: Highlights morning and evening peak times - see those big spikes at 8am and 5pm?

This tells us that bike demand follows clear patterns - people use bikes during commute hours."

---

## Part 3: Time Series Analysis (25 seconds)
*[Scroll to Time Series section]*

"Now let's look at how demand changes over time.

**Hour of Day**: This chart shows one typical day at MIT station. You can see demand is very low overnight, then spikes during morning and evening rush hours.

**By Month**: This shows how demand changes across the year. Notice how summer months have higher usage - people ride more when it's warm.

**Time Series**: This is the full timeline of hourly demand. You can see the daily patterns repeating, with weekly cycles and seasonal trends."

---

## Part 4: Model Results (35 seconds)
*[Scroll to Model Results section]*

"We built three different models to predict demand:

**1. Poisson Model** (baseline):
- This is our starting point
- Look at the confusion matrices - it works okay but struggles with peak hours

**2. Negative Binomial with Boosting**:
- This model handles high-variance data better
- The confusion matrices show better performance, especially for high-demand periods

**3. ZINB Model** (Zero-Inflated Negative Binomial):
- This model is smart about handling stations that are often empty
- It separates 'structural zeros' (times when stations should be empty) from regular low demand

The comparison table shows that Negative Binomial and ZINB perform best, with about 3.3 bikes average error per hour."

---

## Part 5: Real-time Map Demo (20 seconds)
*[Navigate to /map]*

"Now let's see it in action! Here's our real-time map of Boston Bluebikes stations.

**Current View**:
- Green markers: Stations with many bikes (good for riders)
- Red markers: Stations with no bikes
- You can click any station to see details

**Prediction Feature**: 
- Move the time slider to see predictions for future hours
- The system uses weather, time of day, and station features to predict how many bikes will be available
- This helps riders plan ahead and helps operators know where to move bikes

**Statistics Panel**: Shows total stations, bikes available, and utilization rates across the network."

---

## Closing (10 seconds)
*[Return to homepage]*

"In summary, we created a complete system: from data exploration, to building multiple models, to a working web application that helps people find bikes. The models achieve good accuracy, and the visualization helps understand both the patterns in the data and the model performance.

Thank you! Questions?"

---

## Tips for Demo:
1. **Practice transitions** between pages - use keyboard shortcuts to switch tabs quickly
2. **Point out specific numbers** - "Look at station 5, it peaks at 8am with 25 bikes"
3. **Emphasize practical value** - "This helps a rider know if they should walk to a different station"
4. **Keep it conversational** - Use "you can see" and "notice how" instead of reading slides
5. **Time management**: If running short, skip to Part 5 (the map) - it's the most impressive

---

## Alternative Quick Version (1 minute):
If you need to cut it down:
- Skip Part 2 details (10 seconds)
- Skip Part 3 details (10 seconds)  
- Show one model result only (15 seconds)
- Focus on map demo (25 seconds)
