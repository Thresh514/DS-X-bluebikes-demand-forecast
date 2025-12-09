import { ImageItem, ModelInfo, ModelId, SectionId } from "./types";

// ============================================================
// Model Information and Metrics
// ============================================================

export const models: ModelInfo[] = [
  {
    id: "poisson",
    name: "Poisson Regression",
    description:
      "Initial baseline model using Poisson distribution for count data",
    metrics: [
      {
        name: "MAE (Train)",
        value: 4.491,
        unit: "bikes",
        higherIsBetter: false,
      },
      {
        name: "MAE (Test)",
        value: 4.479,
        unit: "bikes",
        higherIsBetter: false,
      },
      {
        name: "RMSE (Train)",
        value: 6.018,
        unit: "bikes",
        higherIsBetter: false,
      },
      {
        name: "RMSE (Test)",
        value: 5.998,
        unit: "bikes",
        higherIsBetter: false,
      },
      { name: "Precision", value: 0.9214, higherIsBetter: true },
      { name: "Recall", value: 1.0, higherIsBetter: true },
      { name: "F1 Score", value: 0.9591, higherIsBetter: true },
      { name: "Threshold", value: 1, notes: "Classification threshold" },
    ],
  },
  {
    id: "nb_boost",
    name: "Negative Binomial + Boosting",
    description:
      "Enhanced model using Negative Binomial with Gradient Boosting to handle overdispersion",
    metrics: [
      {
        name: "MAE (Train)",
        value: 2.725,
        unit: "bikes",
        higherIsBetter: false,
      },
      {
        name: "MAE (Test)",
        value: 2.736,
        unit: "bikes",
        higherIsBetter: false,
      },
      {
        name: "RMSE (Train)",
        value: 3.851,
        unit: "bikes",
        higherIsBetter: false,
      },
      {
        name: "RMSE (Test)",
        value: 3.887,
        unit: "bikes",
        higherIsBetter: false,
      },
      { name: "Precision", value: 0.8346, higherIsBetter: true },
      { name: "Recall", value: 0.8913, higherIsBetter: true },
      { name: "F1 Score", value: 0.8621, higherIsBetter: true },
      { name: "Threshold", value: 4, notes: "Classification threshold" },
    ],
  },
  {
    id: "zinb_in",
    name: "ZINB (Inflow)",
    description: "Zero-Inflated Negative Binomial model for bike arrivals",
    metrics: [
      {
        name: "MAE (Test)",
        value: 3.708,
        unit: "bikes",
        higherIsBetter: false,
      },
      {
        name: "RMSE (Test)",
        value: 5.609,
        unit: "bikes",
        higherIsBetter: false,
      },
      { name: "R²", value: 0.1713, higherIsBetter: true },
      { name: "Mean π", value: 0.2849, notes: "Zero-inflation probability" },
      { name: "Mean μ", value: 5.5554, notes: "NB mean parameter" },
      {
        name: "Dispersion α",
        value: 0.7084,
        notes: "Overdispersion parameter",
      },
      {
        name: "Actual Zero Prop",
        value: 0.2776,
        notes: "Actual proportion of zeros",
      },
      {
        name: "Predicted Zero Prop",
        value: 0.0026,
        notes: "Predicted proportion of zeros",
      },
    ],
  },
  {
    id: "zinb_out",
    name: "ZINB (Outflow)",
    description: "Zero-Inflated Negative Binomial model for bike departures",
    metrics: [
      {
        name: "MAE (Test)",
        value: 3.696,
        unit: "bikes",
        higherIsBetter: false,
      },
      {
        name: "RMSE (Test)",
        value: 5.677,
        unit: "bikes",
        higherIsBetter: false,
      },
      { name: "R²", value: 0.1844, higherIsBetter: true },
      { name: "Mean π", value: 0.2889, notes: "Zero-inflation probability" },
      { name: "Mean μ", value: 5.4966, notes: "NB mean parameter" },
      {
        name: "Dispersion α",
        value: 0.7084,
        notes: "Overdispersion parameter",
      },
      {
        name: "Actual Zero Prop",
        value: 0.2848,
        notes: "Actual proportion of zeros",
      },
      {
        name: "Predicted Zero Prop",
        value: 0.0104,
        notes: "Predicted proportion of zeros",
      },
    ],
  },
];

// ============================================================
// Image Gallery Data
// ============================================================

export const images: ImageItem[] = [
  // Data Exploration - Global
  {
    id: "global-distribution",
    title: "Global IN/OUT Distribution",
    description:
      "Histogram showing the overall distribution of bike inflow and outflow counts across all stations",
    section: "data_exploration",
    src: "/01_data_exploration/global_distribution.png",
    tags: ["distribution", "global"],
  },

  // Data Exploration - Station Distributions (20 stations × 2 plots each)
  ...Array.from({ length: 20 }, (_, i) => {
    const stationNum = i + 1;
    const stationId = `station-${stationNum.toString().padStart(2, "0")}`;
    return [
      {
        id: `${stationId}-distribution`,
        title: `Station #${stationNum}: IN/OUT Distribution`,
        description: `Frequency distribution of bike inflow and outflow for station #${stationNum}`,
        section: "data_exploration" as SectionId,
        src: `/01_data_exploration/station_distributions/station_${stationNum.toString().padStart(2, "0")}_distribution.png`,
        tags: ["distribution", stationId],
      },
      {
        id: `${stationId}-rush`,
        title: `Station #${stationNum}: Rush Hour Patterns`,
        description: `Morning and evening rush hour bike activity patterns for station #${stationNum}`,
        section: "data_exploration" as SectionId,
        src: `/01_data_exploration/station_distributions/station_${stationNum.toString().padStart(2, "0")}_rush_hours.png`,
        tags: ["rush-hour", stationId],
      },
    ];
  }).flat(),

  // Time Series
  {
    id: "mit-timeseries",
    title: "MIT Station: Hourly Time Series",
    description:
      "Full-year hourly bike IN/OUT counts for MIT at Mass Ave / Amherst St station",
    section: "time_series",
    src: "/02_time_series/mit_hourly_timeseries.png",
    tags: ["time-series", "mit"],
  },
  {
    id: "mit-hour-of-day",
    title: "MIT Station: Hour of Day Aggregation",
    description: "Aggregated monthly totals by hour of day for MIT station",
    section: "time_series",
    src: "/02_time_series/mit_hour_of_day.png",
    tags: ["hourly", "aggregation", "mit"],
  },
  {
    id: "mit-monthly-curves",
    title: "MIT Station: Monthly Hourly Curves",
    description: "Hourly flow patterns broken down by month for MIT station",
    section: "time_series",
    src: "/02_time_series/mit_hourly_by_month.png",
    tags: ["monthly", "curves", "mit"],
  },

  // Monthly time series (12 months)
  ...[
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ].map((month) => ({
    id: `mit-monthly-2024${month}`,
    title: `MIT Station: 2024-${month} Hourly Activity`,
    description: `Hourly bike activity for MIT station in ${month}/2024`,
    section: "time_series" as SectionId,
    src: `/02_time_series/monthly/mit_mass_ave_hourly_2024${month}.png`,
    tags: ["monthly", "mit", `2024-${month}`],
  })),

  // Poisson Model
  {
    id: "poisson-cm-train",
    title: "Poisson: Training Confusion Matrix",
    description:
      "Confusion matrix showing Poisson model performance on training data",
    section: "poisson",
    modelId: "poisson",
    src: "/03_poisson_model/confusion_matrix_train.png",
    tags: ["confusion-matrix", "train"],
  },
  {
    id: "poisson-cm-test",
    title: "Poisson: Test Confusion Matrix",
    description:
      "Confusion matrix showing Poisson model performance on test data",
    section: "poisson",
    modelId: "poisson",
    src: "/03_poisson_model/confusion_matrix_test.png",
    tags: ["confusion-matrix", "test"],
  },

  // NB + Boosting Model
  {
    id: "nb-boost-cm-train",
    title: "NB+Boosting: Training Confusion Matrix",
    description:
      "Confusion matrix for Negative Binomial + Gradient Boosting model on training data",
    section: "nb_boosting",
    modelId: "nb_boost",
    src: "/04_nb_boosting_model/boosting_confusion_matrix_train.png",
    tags: ["confusion-matrix", "train"],
  },
  {
    id: "nb-boost-cm-test",
    title: "NB+Boosting: Test Confusion Matrix",
    description:
      "Confusion matrix for Negative Binomial + Gradient Boosting model on test data",
    section: "nb_boosting",
    modelId: "nb_boost",
    src: "/04_nb_boosting_model/boosting_confusion_matrix_test.png",
    tags: ["confusion-matrix", "test"],
  },

  // ZINB Model
  {
    id: "zinb-evaluation-grid",
    title: "ZINB: Comprehensive Evaluation Grid",
    description:
      "12-panel evaluation showing actual vs predicted, residuals, parameter distributions, coefficients, and performance metrics for both IN and OUT ZINB models",
    section: "zinb",
    modelId: "zinb_in",
    src: "/05_zinb_model/zinb_evaluation_grid.png",
    tags: ["evaluation", "comprehensive", "grid"],
  },
];

// ============================================================
// Helper Functions
// ============================================================

export function filterImagesBySection(section: SectionId): ImageItem[] {
  return images.filter((img) => img.section === section);
}

export function filterImagesByModel(modelId: ModelId): ImageItem[] {
  return images.filter((img) => img.modelId === modelId);
}

export function filterImagesByTag(tag: string): ImageItem[] {
  return images.filter((img) => img.tags?.includes(tag));
}

export function getImagesByStation(stationNum: number): ImageItem[] {
  const stationTag = `station-${stationNum.toString().padStart(2, "0")}`;
  return filterImagesByTag(stationTag);
}

export function getSectionLabel(section: SectionId): string {
  const labels: Record<SectionId, string> = {
    data_exploration: "Data Exploration",
    time_series: "Time Series",
    poisson: "Poisson Model",
    nb_boosting: "NB + Boosting",
    zinb: "ZINB Model",
    xgb: "XGBoost Model",
  };
  return labels[section];
}

export function getModelColor(modelId: ModelId): string {
  const colors: Record<ModelId, string> = {
    poisson: "bg-blue-500",
    nb_boost: "bg-green-500",
    zinb_in: "bg-purple-500",
    zinb_out: "bg-pink-500",
    xgb_in: "bg-orange-500",
    xgb_out: "bg-red-500",
  };
  return colors[modelId];
}

export const sections: SectionId[] = [
  "data_exploration",
  "time_series",
  "poisson",
  "nb_boosting",
  "zinb",
];
