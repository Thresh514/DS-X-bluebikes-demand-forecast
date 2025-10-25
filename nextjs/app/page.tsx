"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
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

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Data Visualization
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Interactive charts and dashboards showcasing key metrics
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
            Get Started
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
