import { NextResponse } from "next/server";

// Station features mapping (from feature.csv or station data)
// This should match the TARGET_STATIONS
const STATION_FEATURES: Record<string, {
  dist_subway_m: number;
  dist_bus_m: number;
  dist_university_m: number;
  dist_business: number;
  dist_residential: number;
  restaurant_count: number;
}> = {
  // MIT area stations
  "MIT at Mass Ave / Amherst St": {
    dist_subway_m: 200,
    dist_bus_m: 50,
    dist_university_m: 100,
    dist_business: 500,
    dist_residential: 300,
    restaurant_count: 15
  },
  "Central Square at Mass Ave / Essex St": {
    dist_subway_m: 100,
    dist_bus_m: 30,
    dist_university_m: 400,
    dist_business: 200,
    dist_residential: 300,
    restaurant_count: 20
  },
  "MIT Pacific St at Purrington St": {
    dist_subway_m: 250,
    dist_bus_m: 60,
    dist_university_m: 150,
    dist_business: 600,
    dist_residential: 350,
    restaurant_count: 12
  },
  "Harvard Square at Mass Ave / Dunster St": {
    dist_subway_m: 100,
    dist_bus_m: 30,
    dist_university_m: 50,
    dist_business: 200,
    dist_residential: 400,
    restaurant_count: 25
  },
  "Boylston St at Massachusetts Ave": {
    dist_subway_m: 150,
    dist_bus_m: 40,
    dist_university_m: 800,
    dist_business: 100,
    dist_residential: 200,
    restaurant_count: 30
  },
  "Charles St at Cambridge St": {
    dist_subway_m: 180,
    dist_bus_m: 45,
    dist_university_m: 1000,
    dist_business: 150,
    dist_residential: 250,
    restaurant_count: 22
  },
  "Forsyth St at Huntington Ave": {
    dist_subway_m: 120,
    dist_bus_m: 35,
    dist_university_m: 200,
    dist_business: 300,
    dist_residential: 400,
    restaurant_count: 18
  },
  "Boylston St at Fairfield St": {
    dist_subway_m: 200,
    dist_bus_m: 50,
    dist_university_m: 900,
    dist_business: 150,
    dist_residential: 300,
    restaurant_count: 25
  },
  "Christian Science Plaza - Massachusetts Ave at Westland Ave": {
    dist_subway_m: 160,
    dist_bus_m: 40,
    dist_university_m: 300,
    dist_business: 250,
    dist_residential: 350,
    restaurant_count: 16
  },
  "MIT Stata Center at Vassar St / Main St": {
    dist_subway_m: 220,
    dist_bus_m: 55,
    dist_university_m: 80,
    dist_business: 550,
    dist_residential: 320,
    restaurant_count: 14
  }
};

// Default features for unknown stations
const DEFAULT_FEATURES = {
  dist_subway_m: 200,
  dist_bus_m: 50,
  dist_university_m: 500,
  dist_business: 300,
  dist_residential: 300,
  restaurant_count: 15
};

interface FrontendRequest {
  temperature?: number;
  rainfall?: number;
  hour_of_week: number;
  isWeekend: number;
  month: number;
  prediction_minutes?: number;
  longitude: number;
  latitude: number;
  station_name?: string;
}

interface BackendRequest {
  hour_of_day: number;
  day_of_week: number;
  month: number;
  is_weekend: number;
  station_lat: number;
  station_lng: number;
  dist_subway_m: number;
  dist_bus_m: number;
  dist_university_m: number;
  dist_business: number;
  dist_residential: number;
  restaurant_count: number;
}

function convertToBackendFormat(frontendData: FrontendRequest[]): BackendRequest[] {
  return frontendData.map(data => {
    // Convert hour_of_week (0-167) to hour_of_day (0-23) and day_of_week (0-6)
    const hour_of_day = data.hour_of_week % 24;
    const day_of_week = Math.floor(data.hour_of_week / 24);

    // Get station features (use station_name if available, otherwise use defaults)
    const features = data.station_name && STATION_FEATURES[data.station_name]
      ? STATION_FEATURES[data.station_name]
      : DEFAULT_FEATURES;

    return {
      hour_of_day,
      day_of_week,
      month: data.month,
      is_weekend: data.isWeekend,
      station_lat: data.latitude,
      station_lng: data.longitude,
      ...features
    };
  });
}

export async function POST(req: Request) {
  try {
    const body: FrontendRequest[] = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: expected array of station data" },
        { status: 400 }
      );
    }

    // Convert frontend format to backend format
    const backendRequests = convertToBackendFormat(body);

    console.log(`Making prediction for ${backendRequests.length} stations`);

    const FLASK_URL = process.env.FLASK_URL || "http://127.0.0.1:5000";

    const res = await fetch(`${FLASK_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendRequests),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Flask API error (${res.status}):`, errorText);

      // Try to parse as JSON
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json(
          { error: errorJson.error || "Prediction failed", details: errorJson },
          { status: res.status }
        );
      } catch {
        return NextResponse.json(
          { error: "Prediction failed", details: errorText },
          { status: res.status }
        );
      }
    }

    const result = await res.json();

    console.log(`Prediction successful: ${result.predictions?.length || 0} results`);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error in prediction API route:", error);

    // Check if it's a connection error
    if (error instanceof Error && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error: "Cannot connect to Flask backend",
          details: "Make sure Flask server is running on port 5000",
          hint: "Run: make run-backend"
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
