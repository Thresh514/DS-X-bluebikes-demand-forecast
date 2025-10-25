"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

interface TimeSliderProps {
  onTimeChange?: (minutes: number) => void;
  defaultValue?: number;
  className?: string;
}

export function TimeSlider({
  onTimeChange,
  defaultValue = 0,
  className = "",
}: TimeSliderProps) {
  const [minutes, setMinutes] = useState(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setMinutes(value);
    onTimeChange?.(value);
  };

  const formatTime = (mins: number) => {
    const now = new Date();
    const futureTime = new Date(now.getTime() + mins * 60000);
    return futureTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeLabel = (mins: number) => {
    if (mins === 0) return "now";
    return `${mins} minutes later`;
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
            {formatTime(minutes)}
          </div>
          <div className="text-xs text-gray-500">{getTimeLabel(minutes)}</div>
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min="0"
          max="60"
          step="1"
          value={minutes}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(minutes / 60) * 100}%, #E5E7EB ${(minutes / 60) * 100}%, #E5E7EB 100%)`,
          }}
        />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0 minutes</span>
          <span>15 minutes</span>
          <span>30 minutes</span>
          <span>45 minutes</span>
          <span>60 minutes</span>
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
