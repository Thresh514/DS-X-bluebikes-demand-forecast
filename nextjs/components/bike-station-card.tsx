import { BikeStation } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bike, ParkingCircle, MapPin, Clock, TrendingUp, TrendingDown } from "lucide-react";

interface BikeStationCardProps {
  station: BikeStation;
  onClick?: () => void;
}

export function BikeStationCard({ station, onClick }: BikeStationCardProps) {
  // 如果有预测数据，使用预测值；否则使用当前值
  const bikeAvailability = station.predicted_bikes_available !== undefined 
    ? station.predicted_bikes_available 
    : station.num_bikes_available;
  const dockAvailability = station.predicted_docks_available !== undefined 
    ? station.predicted_docks_available 
    : station.num_docks_available;
  const utilizationRate = (bikeAvailability / station.capacity) * 100;
  
  // 是否在预测模式
  const isPredicting = station.predicted_bikes_available !== undefined;

  const getBikeStatusVariant = () => {
    if (bikeAvailability === 0) return "danger";
    if (bikeAvailability <= 3) return "warning";
    return "success";
  };

  const getDockStatusVariant = () => {
    if (dockAvailability === 0) return "danger";
    if (dockAvailability <= 3) return "warning";
    return "success";
  };

  const formatLastReported = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString("en-US");
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span className="line-clamp-2">{station.name}</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Bike className="h-4 w-4" />
              <span>Bikes Available</span>
            </div>
            <Badge variant={getBikeStatusVariant()} className="justify-center">
              {isPredicting && (
                <span className="text-xs opacity-60 line-through mr-1">
                  {station.num_bikes_available}
                </span>
              )}
              {bikeAvailability} bikes
            </Badge>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <ParkingCircle className="h-4 w-4" />
              <span>Docks Available</span>
            </div>
            <Badge variant={getDockStatusVariant()} className="justify-center">
              {isPredicting && (
                <span className="text-xs opacity-60 line-through mr-1">
                  {station.num_docks_available}
                </span>
              )}
              {dockAvailability} docks
            </Badge>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Utilization Rate</span>
            <span>{utilizationRate.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all"
              style={{ width: `${utilizationRate}%` }}
            />
          </div>
          <div className="text-xs text-gray-500">
            Total Capacity: {station.capacity} docks
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 pt-1 border-t">
          <Clock className="h-3 w-3" />
          <span>Updated at {formatLastReported(station.last_reported)}</span>
        </div>

        {(station.predicted_arrivals !== undefined || station.predicted_departures !== undefined) && (
          <div className="space-y-2 pt-2 border-t border-blue-200 bg-blue-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
            <div className="text-sm font-semibold text-blue-800 mb-2">
              Predicted Data
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 bg-white rounded-md p-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-lg font-bold text-green-700">
                  +{station.predicted_arrivals || 0}
                </span>
                <span className="text-xs text-gray-600">Arrivals</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-md p-2">
                <TrendingDown className="h-4 w-4 text-orange-600" />
                <span className="text-lg font-bold text-orange-700">
                  -{station.predicted_departures || 0}
                </span>
                <span className="text-xs text-gray-600">Departures</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
