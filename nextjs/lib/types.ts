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