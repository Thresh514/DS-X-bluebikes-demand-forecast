import { NextResponse } from "next/server";
import type { BikeStation, StationInfo, StationStatus } from "@/lib/types";
import { TARGET_STATIONS } from "@/lib/target-stations";

export async function GET() {
  try {
    // 1. parallel fetch two JSON APIs
    const [infoRes, statusRes] = await Promise.all([
      fetch("https://gbfs.bluebikes.com/gbfs/en/station_information.json", {
        cache: "no-store",
      }),
      fetch("https://gbfs.bluebikes.com/gbfs/en/station_status.json", {
        cache: "no-store",
      }),
    ]);

    if (!infoRes.ok || !statusRes.ok) {
      throw new Error("Failed to fetch data from Bluebikes API");
    }

    const infoJson = await infoRes.json();
    const statusJson = await statusRes.json();

    const info: StationInfo[] = infoJson.data.stations;
    const status: StationStatus[] = statusJson.data.stations;

    // 2. merge data by station_id
    const merged: BikeStation[] = info.map((station) => {
      const s = status.find((st) => st.station_id === station.station_id);
      return {
        station_id: station.station_id,
        name: station.name,
        capacity: station.capacity,
        lat: station.lat,
        lon: station.lon,
        num_bikes_available: s?.num_bikes_available ?? 0,
        num_docks_available: s?.num_docks_available ?? 0,
        last_reported: s?.last_reported ?? Date.now() / 1000,
      };
    });

    // 3. Filter to only include target stations
    // Direct name matching - station names should match exactly
    const filtered = merged.filter((station) =>
      TARGET_STATIONS.includes(station.name),
    );

    // Log matched stations for debugging
    console.log(
      `Filtered ${filtered.length} target stations out of ${merged.length} total stations`,
    );
    if (filtered.length < TARGET_STATIONS.length) {
      console.warn(
        `Warning: Only found ${filtered.length} out of ${TARGET_STATIONS.length} target stations`,
      );
      const foundNames = filtered.map((s) => s.name);
      const missing = TARGET_STATIONS.filter(
        (name) => !foundNames.includes(name),
      );
      if (missing.length > 0) {
        console.warn("Missing stations:", missing);
      }
    }

    // 4. return filtered JSON (only target stations)
    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error fetching Bluebikes data:", error);
    return NextResponse.json(
      { error: "Failed to fetch Bluebikes data" },
      { status: 500 },
    );
  }
}
