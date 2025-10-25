"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { BikeStation } from "@/lib/types";
import { BikeStationCard } from "@/components/bike-station-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Search,
  MapPin,
  Bike,
  ParkingCircle,
  TrendingUp,
} from "lucide-react";

const BikeMap = dynamic(
  () => import("@/components/bike-map").then((mod) => mod.BikeMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    ),
  },
);

export default function MapPage() {
  const [stations, setStations] = useState<BikeStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<BikeStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState<BikeStation | null>(
    null,
  );
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchStations = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await fetch("/api/bikes");
      const data = await res.json();
      setStations(data);
      setFilteredStations(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("获取站点数据失败:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStations();

    const interval = setInterval(() => {
      fetchStations(true);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStations(stations);
    } else {
      const filtered = stations.filter((station) =>
        station.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredStations(filtered);
    }
  }, [searchQuery, stations]);

  const stats = {
    totalStations: stations.length,
    totalBikes: stations.reduce((sum, s) => sum + s.num_bikes_available, 0),
    totalDocks: stations.reduce((sum, s) => sum + s.num_docks_available, 0),
    averageUtilization:
      stations.length > 0
        ? (
            stations.reduce(
              (sum, s) => sum + (s.num_bikes_available / s.capacity) * 100,
              0,
            ) / stations.length
          ).toFixed(1)
        : 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-lg text-gray-600">
            Loading Bluebikes real-time data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bluebikes Real-time Map
              </h1>
              <p className="text-sm text-gray-600">
                {lastUpdate &&
                  `Last updated: ${lastUpdate.toLocaleTimeString("en-US")}`}
              </p>
            </div>
            <Button
              onClick={() => fetchStations(true)}
              disabled={refreshing}
              variant="outline"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium text-gray-600 flex items-center gap-2 tracking-wide">
                <MapPin className="h-4 w-4" />
                Total Stations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium text-gray-600 flex items-center gap-2 tracking-wide">
                <Bike className="h-4 w-4" />
                Available Bikes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalBikes}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium text-gray-600 flex items-center gap-2 tracking-wide">
                <ParkingCircle className="h-4 w-4" />
                Available Docks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalDocks}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium text-gray-600 flex items-center gap-2 tracking-wide">
                <TrendingUp className="h-4 w-4" />
                Average Utilization Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageUtilization}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardContent className="p-4 h-full">
                <BikeMap
                  stations={filteredStations}
                  onStationClick={setSelectedStation}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Station List</span>
                  <Badge variant="secondary">
                    {filteredStations.length} stations
                  </Badge>
                </CardTitle>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search station name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-3">
                {filteredStations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No matching stations found
                  </div>
                ) : (
                  filteredStations.map((station) => (
                    <BikeStationCard
                      key={station.station_id}
                      station={station}
                      onClick={() => setSelectedStation(station)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6 flex flex-row items-center justify-center">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-6">
              <CardTitle className="text-sm">Map Legend</CardTitle>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-sm text-gray-700">
                  Many bikes (&gt;7)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-700">
                  Medium (4-7 bikes)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500" />
                <span className="text-sm text-gray-700">
                  Few bikes (1-3 bikes)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-sm text-gray-700">
                  No bikes (0 bikes)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
