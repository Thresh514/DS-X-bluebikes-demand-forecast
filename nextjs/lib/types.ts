export interface BikeStation {
  station_id: string;
  name: string;
  capacity: number;
  lat: number;
  lon: number;
  num_bikes_available: number;
  num_docks_available: number;
  last_reported: number;
  predicted_arrivals?: number;
  predicted_departures?: number;
  predicted_bikes_available?: number;
  predicted_docks_available?: number;
}

export interface StationInfo {
  station_id: string;
  name: string;
  capacity: number;
  lat: number;
  lon: number;
}

export interface StationStatus {
  station_id: string;
  num_bikes_available: number;
  num_docks_available: number;
  last_reported: number;
}

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  precipitation: number;
  unit: {
    temperature: string;
    windSpeed: string;
    precipitation: string;
  };
  time: string;
}

// Visualization types
export type ModelId =
  | "poisson"
  | "nb_boost"
  | "zinb_in"
  | "zinb_out"
  | "xgb_in"
  | "xgb_out";

export type SectionId =
  | "data_exploration"
  | "time_series"
  | "poisson"
  | "nb_boosting"
  | "zinb"
  | "xgb";

export interface ModelMetric {
  name: string;
  value: number | string;
  unit?: string;
  higherIsBetter?: boolean;
  notes?: string;
}

export interface ImageItem {
  id: string;
  title: string;
  description: string;
  modelId?: ModelId;
  section: SectionId;
  src: string;
  tags?: string[];
}

export interface ModelInfo {
  id: ModelId;
  name: string;
  description: string;
  metrics: ModelMetric[];
}
