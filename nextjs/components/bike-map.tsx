"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { BikeStation } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Bike, ParkingCircle, MapPin, TrendingUp, TrendingDown } from "lucide-react";
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
    // 如果有预测数据，使用预测值；否则使用当前值
    const availability = station.predicted_bikes_available !== undefined 
      ? station.predicted_bikes_available 
      : station.num_bikes_available;
    
    if (availability === 0) return "#ef4444";      // 红色：没有单车
    if (availability <= 3) return "#f59e0b";       // 橙色：单车很少
    if (availability <= 7) return "#3b82f6";       // 蓝色：单车中等
    return "#10b981";                               // 绿色：单车充足
  };

  // 获取标记半径（根据容量和预测状态）
  const getMarkerRadius = (station: BikeStation) => {
    const capacity = station.capacity;
    const isPredicting = station.predicted_bikes_available !== undefined;
    
    // 基础半径
    let baseRadius = 6;
    if (capacity > 30) baseRadius = 10;
    else if (capacity > 20) baseRadius = 8;
    
    // 如果在预测模式，根据单车数量调整大小
    if (isPredicting) {
      const availability = station.predicted_bikes_available!;
      const utilizationRate = availability / capacity;
      
      // 根据使用率调整大小（0.8-1.3倍）
      if (utilizationRate > 0.7) {
        return baseRadius * 1.3; // 单车很多，放大标记
      } else if (utilizationRate < 0.2) {
        return baseRadius * 0.8; // 单车很少，缩小标记
      }
    }
    
    return baseRadius;
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
      {stations.map((station) => {
        const isPredicting = station.predicted_bikes_available !== undefined;
        const availability = isPredicting 
          ? station.predicted_bikes_available 
          : station.num_bikes_available;
        
        // 使用包含预测状态的 key 来强制重新渲染
        const markerKey = `${station.station_id}-${availability}-${isPredicting}`;
        
        return (
          <CircleMarker
            key={markerKey}
            center={[station.lat, station.lon]}
            radius={getMarkerRadius(station)}
            fillColor={getMarkerColor(station)}
            color={"white"}
            weight={2}
            opacity={1}
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
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-base leading-tight">
                    {station.name}
                  </h3>
                </div>
                {station.predicted_bikes_available !== undefined && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                    Predicted
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <Bike className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Bikes Available</span>
                  </div>
                  <Badge
                    variant={
                      (station.predicted_bikes_available ?? station.num_bikes_available) === 0
                        ? "danger"
                        : (station.predicted_bikes_available ?? station.num_bikes_available) <= 3
                          ? "warning"
                          : "success"
                    }
                  >
                    {station.predicted_bikes_available !== undefined && (
                      <span className="text-xs opacity-60 line-through mr-1">
                        {station.num_bikes_available}
                      </span>
                    )}
                    {station.predicted_bikes_available ?? station.num_bikes_available} bikes
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <ParkingCircle className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Docks Available</span>
                  </div>
                  <Badge
                    variant={
                      (station.predicted_docks_available ?? station.num_docks_available) === 0
                        ? "danger"
                        : (station.predicted_docks_available ?? station.num_docks_available) <= 3
                          ? "warning"
                          : "success"
                    }
                  >
                    {station.predicted_docks_available !== undefined && (
                      <span className="text-xs opacity-60 line-through mr-1">
                        {station.num_docks_available}
                      </span>
                    )}
                    {station.predicted_docks_available ?? station.num_docks_available} docks
                  </Badge>
                </div>

                <div className="pt-2 border-t text-xs text-gray-500">
                  Total Capacity: {station.capacity} docks
                </div>

                {(station.predicted_arrivals !== undefined || station.predicted_departures !== undefined) && (
                  <div className="pt-2 border-t space-y-2">
                    <div className="text-xs font-semibold text-blue-800">
                      Predicted Data
                    </div>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">Arrivals:</span>
                        <span className="font-bold text-green-700">
                          +{station.predicted_arrivals || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingDown className="h-4 w-4 text-orange-600" />
                        <span className="text-gray-700">Departures:</span>
                        <span className="font-bold text-orange-700">
                          -{station.predicted_departures || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
