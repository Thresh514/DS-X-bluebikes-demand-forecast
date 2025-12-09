"use client";

import Image from "next/image";
import ImageSlider from "./ImageSlider";
import { Card, CardContent } from "@/components/ui/card";
import {
  filterImagesBySection,
  getImagesByStation,
  filterImagesByTag,
} from "@/lib/visualizations-data";
import { models } from "@/lib/visualizations-data";

export default function BlogContent() {
  // Get all station distribution images
  const stationDistributionImages = Array.from({ length: 20 }, (_, i) => {
    const stationNum = i + 1;
    const stationTag = `station-${stationNum.toString().padStart(2, "0")}`;
    return filterImagesByTag(stationTag).filter((img) =>
      img.tags?.includes("distribution"),
    );
  }).flat();

  const stationRushHourImages = Array.from({ length: 20 }, (_, i) => {
    const stationNum = i + 1;
    const stationTag = `station-${stationNum.toString().padStart(2, "0")}`;
    return filterImagesByTag(stationTag).filter((img) =>
      img.tags?.includes("rush-hour"),
    );
  }).flat();

  const monthlyImages = filterImagesBySection("time_series").filter((img) =>
    img.tags?.includes("monthly"),
  );

  return (
    <div className="max-w-4xl mx-auto space-y-16">
      {/* Introduction */}
      <section id="introduction" className="scroll-mt-24">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Bluebikes Demand Forecasting
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Visualizations and model performance from our bike demand prediction
          models
        </p>
      </section>

      {/* Data Exploration */}
      <section id="data-exploration" className="scroll-mt-24">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Data Exploration
        </h2>

        {/* Global Distribution */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Global Distribution
          </h3>
          <div className="relative w-full h-[500px] bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <Image
              src="/01_data_exploration/global_distribution.png"
              alt="Global IN/OUT Distribution"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        </div>

        {/* Station Distributions */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Station Activity Distributions
          </h3>
          <ImageSlider
            images={stationDistributionImages}
            title=""
            description=""
          />
        </div>

        {/* Rush Hour Patterns */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Rush Hour Patterns
          </h3>
          <ImageSlider images={stationRushHourImages} title="" description="" />
        </div>

        {/* Top 20 Stations */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Top 20 Most Active Stations
          </h3>
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-3 font-semibold">
                        Rank
                      </th>
                      <th className="text-left py-2 px-3 font-semibold">
                        Station Name
                      </th>
                      <th className="text-right py-2 px-3 font-semibold">IN</th>
                      <th className="text-right py-2 px-3 font-semibold">
                        OUT
                      </th>
                      <th className="text-right py-2 px-3 font-semibold">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        rank: 1,
                        name: "MIT at Mass Ave / Amherst St",
                        in: 66221,
                        out: 66398,
                      },
                      {
                        rank: 2,
                        name: "Central Square at Mass Ave / Essex St",
                        in: 50604,
                        out: 50973,
                      },
                      {
                        rank: 3,
                        name: "Harvard Square at Mass Ave/ Dunster",
                        in: 49831,
                        out: 48701,
                      },
                      {
                        rank: 4,
                        name: "Ames St at Main St",
                        in: 39387,
                        out: 35918,
                      },
                      {
                        rank: 5,
                        name: "MIT Pacific St at Purrington St",
                        in: 35707,
                        out: 37211,
                      },
                    ].map((station) => (
                      <tr
                        key={station.rank}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        <td className="py-2 px-3 font-medium">
                          {station.rank}
                        </td>
                        <td className="py-2 px-3">{station.name}</td>
                        <td className="py-2 px-3 text-right">
                          {station.in.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {station.out.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold">
                          {(station.in + station.out).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Time Series Analysis */}
      <section id="time-series" className="scroll-mt-24">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Time Series Analysis
        </h2>

        {/* Full Year Time Series */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Full-Year Hourly Time Series
          </h3>
          <div className="relative w-full h-[500px] bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <Image
              src="/02_time_series/mit_hourly_timeseries.png"
              alt="MIT Station Hourly Time Series"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        </div>

        {/* Hour of Day */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Hour of Day Aggregation
          </h3>
          <div className="relative w-full h-[500px] bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <Image
              src="/02_time_series/mit_hour_of_day.png"
              alt="MIT Station Hour of Day"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        </div>

        {/* Monthly Patterns */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Monthly Patterns
          </h3>
          <ImageSlider images={monthlyImages} title="" description="" />
        </div>
      </section>

      {/* Model Development */}
      <section id="models" className="scroll-mt-24">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Model Results
        </h2>

        {/* Poisson Model */}
        <div id="poisson-model" className="mb-12 scroll-mt-24">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Poisson Regression
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Training Set
              </div>
              <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <Image
                  src="/03_poisson_model/confusion_matrix_train.png"
                  alt="Poisson Training Confusion Matrix"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Test Set
              </div>
              <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <Image
                  src="/03_poisson_model/confusion_matrix_test.png"
                  alt="Poisson Test Confusion Matrix"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            MAE: 4.479 | RMSE: 5.998 | F1: 0.9591
          </div>
        </div>

        {/* NB + Boosting */}
        <div id="nb-boosting" className="mb-12 scroll-mt-24">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Negative Binomial + Boosting
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Training Set
              </div>
              <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <Image
                  src="/04_nb_boosting_model/boosting_confusion_matrix_train.png"
                  alt="NB+Boosting Training Confusion Matrix"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Test Set
              </div>
              <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <Image
                  src="/04_nb_boosting_model/boosting_confusion_matrix_test.png"
                  alt="NB+Boosting Test Confusion Matrix"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="text-green-600 dark:text-green-400 font-semibold">
              ⭐ Best Performance
            </span>{" "}
            | MAE: 2.736 | RMSE: 3.887 | F1: 0.8621
          </div>
        </div>

        {/* ZINB Model */}
        <div id="zinb-model" className="mb-12 scroll-mt-24">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Zero-Inflated Negative Binomial (ZINB)
          </h3>
          <div className="relative w-full h-[700px] bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <Image
              src="/05_zinb_model/zinb_evaluation_grid.png"
              alt="ZINB Comprehensive Evaluation"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            <div>
              <strong>OUT:</strong> MAE: 3.696 | RMSE: 5.677 | R²: 0.1844
            </div>
            <div>
              <strong>IN:</strong> MAE: 3.708 | RMSE: 5.609 | R²: 0.1713
            </div>
          </div>
        </div>
      </section>

      {/* Model Comparison */}
      <section id="comparison" className="scroll-mt-24">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Model Comparison
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 font-semibold">Model</th>
                    <th className="text-right py-2 px-3 font-semibold">
                      MAE (Test)
                    </th>
                    <th className="text-right py-2 px-3 font-semibold">
                      RMSE (Test)
                    </th>
                    <th className="text-right py-2 px-3 font-semibold">R²</th>
                    <th className="text-right py-2 px-3 font-semibold">
                      F1 Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model) => {
                    const mae = model.metrics.find((m) =>
                      m.name.includes("MAE (Test)"),
                    );
                    const rmse = model.metrics.find((m) =>
                      m.name.includes("RMSE (Test)"),
                    );
                    const r2 = model.metrics.find((m) => m.name === "R²");
                    const f1 = model.metrics.find((m) => m.name === "F1 Score");

                    return (
                      <tr
                        key={model.id}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        <td className="py-2 px-3 font-medium">{model.name}</td>
                        <td className="py-2 px-3 text-right">
                          {mae
                            ? typeof mae.value === "number"
                              ? mae.value.toFixed(3)
                              : mae.value
                            : "-"}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {rmse
                            ? typeof rmse.value === "number"
                              ? rmse.value.toFixed(3)
                              : rmse.value
                            : "-"}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {r2
                            ? typeof r2.value === "number"
                              ? r2.value.toFixed(4)
                              : r2.value
                            : "-"}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {f1
                            ? typeof f1.value === "number"
                              ? f1.value.toFixed(4)
                              : f1.value
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
