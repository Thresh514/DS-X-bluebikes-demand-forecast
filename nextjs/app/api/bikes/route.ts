import { NextResponse } from "next/server";
import type { BikeStation, StationInfo, StationStatus } from "@/lib/types";

export async function GET() {
  try {
    // 1. 并行拉取两个 JSON API
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

    // 2. 按 station_id 合并数据
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

    // 3. 返回 JSON
    return NextResponse.json(merged);
  } catch (error) {
    console.error("Error fetching Bluebikes data:", error);
    return NextResponse.json(
      { error: "Failed to fetch Bluebikes data" },
      { status: 500 },
    );
  }
}
