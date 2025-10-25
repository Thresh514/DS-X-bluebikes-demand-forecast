import { NextResponse } from "next/server";

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  precipitation: number;
  unit: {
    temperature: string;
    windSpeed: string;
    precipitation: string;
  };
  time: string;
}

export async function GET() {
  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=42.3601&longitude=-71.0589&hourly=temperature_2m,wind_speed_10m,precipitation&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&forecast_days=1&timezone=America%2FNew_York",
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather data from Open-Meteo API");
    }

    const data = await response.json();

    // 获取美东时区的当前时间
    const nowET = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    const dateET = new Date(nowET);
    const currentHourET =
      new Date(
        dateET.getFullYear(),
        dateET.getMonth(),
        dateET.getDate(),
        dateET.getHours(),
      )
        .toISOString()
        .slice(0, 13)
        .replace("T", " ") + ":00";

    // 查找最接近当前时间的数据
    const currentIndex = data.hourly.time.findIndex(
      (t: string) => t === currentHourET,
    );
    const index = currentIndex >= 0 ? currentIndex : 0;

    // 返回当前小时的天气数据（基于1小时timeframe）
    const weatherData: WeatherData = {
      temperature: data.hourly.temperature_2m[index],
      windSpeed: data.hourly.wind_speed_10m[index],
      precipitation: data.hourly.precipitation[index],
      unit: {
        temperature: data.hourly_units.temperature_2m,
        windSpeed: data.hourly_units.wind_speed_10m,
        precipitation: data.hourly_units.precipitation,
      },
      time: data.hourly.time[index],
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 },
    );
  }
}
