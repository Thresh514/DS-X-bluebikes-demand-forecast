# Pipeline Directory

This directory contains data processing notebooks, scripts, and intermediate outputs.

## Structure

### Core Notebooks
- `2024_clean.ipynb` - Data cleaning for 2024 Bluebikes data
- `BluebikeForecast.ipynb` - Main forecasting notebook with ZINB model
- `poisson_with_features.ipynb` - Poisson regression model implementation

### Scripts
- `fill_features.py` - Feature engineering script
- `train_model.py` - Model training script
- `data_clean.do` - Stata data cleaning script

### Output Files
- `mit_mass_ave_hourly*.png` - Time series visualizations for MIT station
- `mit_mass_ave_hourly*.csv` - Time series data files
- `plots_by_month/` - Monthly breakdown visualizations (12 PNG files)

### Archive
- `archive/` - Contains duplicate and temporary files:
  - `neg_with_features copy.ipynb` - Duplicate copy
  - `prompt2 copy.ipynb` - Duplicate copy
  - `prompt1.ipynb` - Temporary test file
  - `prompt2.ipynb` - Temporary test file

## Note
- Final visualizations are stored in `/visualizations/` directory
- Intermediate PNG/CSV files in this directory are kept for reference but can be regenerated from notebooks

