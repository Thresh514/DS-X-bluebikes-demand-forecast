import { NextResponse } from "next/server";
import type { BikeStation, StationInfo, StationStatus } from "@/lib/types";

export async function GET() {
  try {
    const [infoRes, statusRes] = await Promise.all([
      fetch("https://gbfs.lyft.com/gbfs/2.3/bkn/en/station_information.json", {
        cache: "no-store",
      }),
      fetch("https://gbfs.lyft.com/gbfs/2.3/bkn/en/station_status.json", {
        cache: "no-store",
      }),
    ]);

    if (!infoRes.ok || !statusRes.ok) {
      throw new Error("Failed to fetch data from Citi Bike GBFS API");
    }

    const infoJson = await infoRes.json();
    const statusJson = await statusRes.json();

    const info: StationInfo[] = infoJson.data.stations;
    const status: StationStatus[] = statusJson.data.stations;

    const merged: BikeStation[] = info.map((station) => {
      const s = status.find((st) => st.station_id === station.station_id);
      return {
        station_id: station.station_id,
        name: station.name,
        capacity: station.capacity ?? 0,
        lat: station.lat,
        lon: station.lon,
        num_bikes_available: s?.num_bikes_available ?? 0,
        num_docks_available: s?.num_docks_available ?? 0,
        last_reported: s?.last_reported ?? Math.floor(Date.now() / 1000),
      };
    });

    return NextResponse.json(merged);
  } catch (error) {
    console.error("Error fetching Citi Bike data:", error);
    return NextResponse.json(
      { error: "Failed to fetch Citi Bike data" },
      { status: 500 },
    );
  }
}
