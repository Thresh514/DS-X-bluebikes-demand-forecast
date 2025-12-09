"use client";

import { useState } from "react";
import { models } from "@/lib/visualizations-data";
import { Card, CardContent } from "@/components/ui/card";

export default function MetricsPanel() {
  const [selectedMetric, setSelectedMetric] = useState<string>("MAE (Test)");
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Get all unique metric names
  const metricNames = Array.from(
    new Set(models.flatMap((model) => model.metrics.map((m) => m.name))),
  );

  // Get comparison metrics (test metrics only for simplicity)
  const comparisonMetrics = ["MAE (Test)", "RMSE (Test)", "R²", "F1 Score"];

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedModels = [...models].sort((a, b) => {
    if (!sortColumn) return 0;

    const aMetric = a.metrics.find((m) => m.name === sortColumn);
    const bMetric = b.metrics.find((m) => m.name === sortColumn);

    if (!aMetric || !bMetric) return 0;

    const aValue = typeof aMetric.value === "number" ? aMetric.value : 0;
    const bValue = typeof bMetric.value === "number" ? bMetric.value : 0;

    return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
  });

  // Get chart data for selected metric
  const getChartData = () => {
    return models
      .map((model) => {
        const metric = model.metrics.find((m) => m.name === selectedMetric);
        return {
          model: model.name,
          value: typeof metric?.value === "number" ? metric.value : 0,
          higherIsBetter: metric?.higherIsBetter ?? false,
        };
      })
      .filter((d) => d.value > 0);
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map((d) => d.value));
  const bestValue =
    chartData.length > 0
      ? chartData[0].higherIsBetter
        ? Math.max(...chartData.map((d) => d.value))
        : Math.min(...chartData.map((d) => d.value))
      : 0;

  return (
    <div className="space-y-4">
      {/* Metrics Table */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Model Metrics
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                    Model
                  </th>
                  {comparisonMetrics.map((metric) => (
                    <th
                      key={metric}
                      className="text-right py-2 px-2 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort(metric)}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {metric.replace(" (Test)", "")}
                        {sortColumn === metric && (
                          <span className="text-xs">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedModels.map((model) => (
                  <tr
                    key={model.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="py-2 px-2 font-medium text-gray-900 dark:text-white">
                      <div className="text-xs">{model.name}</div>
                    </td>
                    {comparisonMetrics.map((metricName) => {
                      const metric = model.metrics.find(
                        (m) => m.name === metricName,
                      );
                      return (
                        <td
                          key={metricName}
                          className="py-2 px-2 text-right text-gray-700 dark:text-gray-300"
                        >
                          {metric ? (
                            <span className="text-xs">
                              {typeof metric.value === "number"
                                ? metric.value.toFixed(3)
                                : metric.value}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Metric Comparison
            </h2>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {comparisonMetrics.map((metric) => (
                <option key={metric} value={metric}>
                  {metric}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {chartData.map((data) => {
              const isBest = data.value === bestValue;
              const widthPercent = (data.value / maxValue) * 100;

              return (
                <div key={data.model} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {data.model}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {data.value.toFixed(3)}
                    </span>
                  </div>
                  <div className="relative h-6 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full transition-all ${isBest ? "bg-green-500" : "bg-blue-500"}`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contextual Note */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              {selectedMetric.includes("MAE") || selectedMetric.includes("RMSE")
                ? "📊 Lower values indicate better performance. NB + Boosting achieves the best error rates."
                : selectedMetric.includes("F1") || selectedMetric.includes("R²")
                  ? "📈 Higher values indicate better performance."
                  : "💡 Compare models across different metrics to understand trade-offs."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Model Insights */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Key Insights
          </h2>
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <p>
                <strong>NB + Boosting</strong> significantly reduces RMSE and
                MAE compared to baseline models, achieving MAE of 2.736 on test
                data.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">ℹ</span>
              <p>
                <strong>Poisson</strong> model provides a strong baseline with
                excellent precision (0.92) but higher error rates due to
                overdispersion.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">⚠</span>
              <p>
                <strong>ZINB models</strong> explicitly handle zero-inflated
                data but show moderate R² values (0.17-0.18), indicating room
                for improvement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
