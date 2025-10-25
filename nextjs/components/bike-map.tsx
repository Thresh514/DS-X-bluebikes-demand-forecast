"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { BikeStation } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Bike, ParkingCircle, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface BikeMapProps {
  stations: BikeStation[];
  onStationClick?: (station: BikeStation) => void;
}

export function BikeMap({ stations, onStationClick }: BikeMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getMarkerColor = (station: BikeStation) => {
    const availability = station.num_bikes_available;
    if (availability === 0) return "#ef4444";
    if (availability <= 3) return "#f59e0b";
    if (availability <= 7) return "#3b82f6";
    return "#10b981";
  };

  // 获取标记半径（根据容量）
  const getMarkerRadius = (capacity: number) => {
    if (capacity > 30) return 10;
    if (capacity > 20) return 8;
    return 6;
  };

  if (!mounted) {
    return (
      <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <MapContainer
      key="bluebikes-map"
      center={[42.3601, -71.0589]}
      zoom={13}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
      className="z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stations.map((station) => (
        <CircleMarker
          key={station.station_id}
          center={[station.lat, station.lon]}
          radius={getMarkerRadius(station.capacity)}
          fillColor={getMarkerColor(station)}
          color="white"
          weight={2}
          opacity={0.9}
          fillOpacity={0.7}
          eventHandlers={{
            click: () => {
              if (onStationClick) {
                onStationClick(station);
              }
            },
          }}
        >
          <Popup>
            <div className="min-w-[250px] p-2">
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <h3 className="font-semibold text-base leading-tight">
                  {station.name}
                </h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <Bike className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Bikes Available</span>
                  </div>
                  <Badge
                    variant={
                      station.num_bikes_available === 0
                        ? "danger"
                        : station.num_bikes_available <= 3
                          ? "warning"
                          : "success"
                    }
                  >
                    {station.num_bikes_available} bikes
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <ParkingCircle className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Docks Available</span>
                  </div>
                  <Badge
                    variant={
                      station.num_docks_available === 0
                        ? "danger"
                        : station.num_docks_available <= 3
                          ? "warning"
                          : "success"
                    }
                  >
                    {station.num_docks_available} docks
                  </Badge>
                </div>

                <div className="pt-2 border-t text-xs text-gray-500">
                  Total Capacity: {station.capacity} docks
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
