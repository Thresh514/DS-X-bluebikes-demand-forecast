# Bluebikes Station Demand Forecasting and User Behavior Analysis

## 1. Project Description

We will use Bluebikes (Boston’s bike-sharing system) open trip data to analyze supply and demand patterns at stations and predict bike availability/empty docks for upcoming time periods. We will also compare usage patterns between members and casual riders to understand differences in their behavior.

## 2. Goals

* **Demand Forecasting:** Predict the number of available bikes or empty docks at a given station in the next hour or another future time window.
* **User Behavior Analysis:** Compare member versus non-member (casual) riders in terms of time, location, trip length, and frequency of use.

## 3. Data Collection Plan

* **Source:** Bluebikes official system data ([https://www.bluebikes.com/system-data](https://www.bluebikes.com/system-data)), which provides monthly CSV files containing each trip’s start/end station, start/end time, and user type.
* **Method:** Download monthly CSV files and merge them into a unified dataset.
* **Optional Supplemental Data:** Weather information from a free API (e.g., OpenWeather) to examine how weather conditions affect demand.

## 4. Modeling Plan

* **Demand Forecasting:**

  * Aggregate trips by station and time to create time series of bike availability/empty docks.
  * Experiment with linear regression, random forests, XGBoost, or other models to predict availability one hour ahead.
* **User Behavior Analysis:**

  * Use descriptive statistics and clustering to highlight differences between members and casual riders (peak hours, common stations, trip distances, etc.).

(We may adjust modeling methods as we learn more techniques in class.)

## 5. Visualization Plan

* **Interactive Map:** Display predicted availability/empty docks for each station (color or size indicating supply level).
* **Time-Series Plots:** Show demand trends at selected stations over time.
* **Comparison Charts:** Bar charts or heatmaps to contrast member versus casual usage across time and space.

## 6. Test Plan

* Split the data by time (e.g., use the first 80% of the time series for training and the last 20% for testing), or train on July–August data and test on September data.
* Evaluate prediction accuracy with metrics such as Mean Squared Error (MSE) or Mean Absolute Error (MAE).

## 7. GitHub Repository

* Create a public GitHub repository; this README.md serves as the proposal and later reports.
* Add data processing scripts, modeling code, visualization notebooks, a Makefile to install dependencies/run code, and a minimal test workflow.