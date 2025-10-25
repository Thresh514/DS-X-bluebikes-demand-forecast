import { BikeStation } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bike, ParkingCircle, MapPin, Clock } from "lucide-react";

interface BikeStationCardProps {
  station: BikeStation;
  onClick?: () => void;
}

export function BikeStationCard({ station, onClick }: BikeStationCardProps) {
  const bikeAvailability = station.num_bikes_available;
  const dockAvailability = station.num_docks_available;
  const utilizationRate = (bikeAvailability / station.capacity) * 100;

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
              {bikeAvailability} bikes
            </Badge>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <ParkingCircle className="h-4 w-4" />
              <span>Docks Available</span>
            </div>
            <Badge variant={getDockStatusVariant()} className="justify-center">
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
      </CardContent>
    </Card>
  );
}

