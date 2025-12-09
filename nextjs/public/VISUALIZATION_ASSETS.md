# Visualization Assets

## Source
These visualization assets are copied from the root `visualizations/` directory, which contains all generated plots and metrics from the Jupyter notebooks.

## Structure
- `01_data_exploration/` - Data exploration plots (global distribution, station-specific distributions, rush hour patterns)
- `02_time_series/` - Time series plots (MIT station hourly data, monthly breakdowns)
- `03_poisson_model/` - Poisson regression model results (confusion matrices)
- `04_nb_boosting_model/` - Negative Binomial + Boosting model results
- `05_zinb_model/` - Zero-Inflated Negative Binomial model evaluation
- `*.md` - Inventory and comparison documents
- `*.csv` - Model metrics summary

## Updating
To refresh these assets after notebook changes:
```bash
cd /path/to/bluebikes-demand-forecast
cp -r visualizations/* nextjs/public/
```

## Access in Next.js
Images are accessible via URLs like:
- `/01_data_exploration/global_distribution.png`
- `/03_poisson_model/confusion_matrix_test.png`
- etc.

