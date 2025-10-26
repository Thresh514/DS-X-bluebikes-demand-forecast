"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

interface TimeSliderProps {
  onTimeChange?: (hours: number) => void;
  defaultValue?: number;
  className?: string;
}

export function TimeSlider({
  onTimeChange,
  defaultValue = 0,
  className = "",
}: TimeSliderProps) {
  const [hours, setHours] = useState(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setHours(value);
    onTimeChange?.(value);
  };

  const formatTime = (hrs: number) => {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hrs * 60 * 60000);
    return futureTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeLabel = (hrs: number) => {
    if (hrs === 0) return "now";
    return `${hrs} hours later`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            Prediction Time
          </span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            {formatTime(hours)}
          </div>
          <div className="text-xs text-gray-500">{getTimeLabel(hours)}</div>
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min="0"
          max="12"
          step="1"
          value={hours}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(hours / 12) * 100}%, #E5E7EB ${(hours / 12) * 100}%, #E5E7EB 100%)`,
          }}
        />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0 hour</span>
          <span>3 hours</span>
          <span>6 hours</span>
          <span>9 hours</span>
          <span>12 hours</span>
        </div>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
}
