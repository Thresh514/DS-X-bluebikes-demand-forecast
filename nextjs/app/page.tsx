"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WeatherData } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/weather");
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col gap-8 items-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Bluebikes Demand Forecast
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Welcome to the Bluebikes Demand Forecasting System
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Real-time Data
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              View current Bluebikes usage and real-time data analysis
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Demand Forecasting
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Intelligent demand prediction based on historical data and machine
              learning
            </p>
          </div>

          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => router.push("/visualizations")}
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Model Results
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Interactive visualization gallery and model performance metrics
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => {
              router.push("/map");
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            View Map
          </button>
          <button
            onClick={() => {
              router.push("/visualizations");
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
          >
            Model Results
          </button>
          <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-md">
            Learn More
          </button>
        </div>
      </main>

      <footer className="mt-16 text-center text-gray-600 dark:text-gray-400">
        <p>© 2025 Bluebikes Demand Forecast. All rights reserved.</p>
      </footer>
    </div>
  );
}
