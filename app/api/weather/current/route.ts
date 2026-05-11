import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

// GET /api/weather/current - Get current weather + forecast for the farm's city
// GET /api/weather/current?demo=true - Returns demo weather without auth
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isDemo = searchParams.get("demo") === "true";

  // Demo mode - no auth required, use wttr.in
  if (isDemo) {
    return getWeatherData("Lahore", "", 40, 5, true);
  }

  // Auth required for real data
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Get farm's weather settings (city, area, thresholds)
  const { data: settings } = await admin
    .from("weather_settings")
    .select("city, area, heat_alert_threshold, cold_alert_threshold, enabled")
    .eq("farm_id", session.farm_id)
    .single();

  if (!settings) {
    // Get city from stations
    const { data: stations } = await admin
      .from("stations")
      .select("city, address")
      .eq("farm_id", session.farm_id)
      .limit(1);

    if (!stations || stations.length === 0) {
      return getWeatherData("Lahore", "", 40, 5, true);
    }

    const city = stations[0].city;
    return getWeatherData(city, "", 40, 5, true);
  }

  if (!settings.enabled) {
    return NextResponse.json({ weather: null, forecast: null, message: "Weather alerts disabled" });
  }

  return getWeatherData(settings.city, settings.area ?? "", settings.heat_alert_threshold, settings.cold_alert_threshold, true);
}

interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  description: string;
  chanceOfRain: number;
  humidity: number;
}

async function getWeatherData(city: string, area: string, heatThreshold: number, coldThreshold: number, includeForecast: boolean) {
  const queryLocation = area && area !== "Farm Area" ? `${area}, ${city}` : city;

  // Try wttr.in (free, no API key needed) as primary
  try {
    // Fetch current weather
    const wttrResponse = await fetch(
      `https://wttr.in/${encodeURIComponent(queryLocation)}?format=j1`,
      { next: { revalidate: 900 } }
    );

    if (wttrResponse.ok) {
      const data = await wttrResponse.json();
      const current = data.current_condition?.[0];

      if (current) {
        const temp = parseInt(current.temp_C, 10);
        const feelsLike = parseInt(current.FeelsLikeC, 10);
        const humidity = parseInt(current.humidity, 10);
        const windKmh = parseInt(current.windspeedKmph, 10);
        const description = current.weatherDesc?.[0]?.value || "Unknown";
        const visibility = parseInt(current.visibility, 10);
        const pressure = parseInt(current.pressure, 10);
        const uvIndex = parseInt(current.uvIndex, 10);

        const alerts: string[] = [];
        if (temp >= heatThreshold) {
          alerts.push(`Heat alert: ${temp}°C — above threshold of ${heatThreshold}°C`);
        }
        if (temp <= coldThreshold) {
          alerts.push(`Cold alert: ${temp}°C — below threshold of ${coldThreshold}°C`);
        }

        // Get forecast if requested
        let forecast: ForecastDay[] = [];
        if (includeForecast && data.weather) {
          forecast = data.weather.slice(0, 3).map((day: {
            date?: string;
            maxTempC?: string;
            minTempC?: string;
            hourly?: Array<{ weatherDesc?: Array<{ value?: string }>; chanceofrain?: string; humidity?: string }>;
          }) => ({
            date: day.date || "",
            maxTemp: parseInt(day.maxTempC || "30", 10),
            minTemp: parseInt(day.minTempC || "20", 10),
            description: day.hourly?.[4]?.weatherDesc?.[0]?.value || "Clear",
            chanceOfRain: parseInt(day.hourly?.[4]?.chanceofrain || "10", 10),
            humidity: parseInt(day.hourly?.[4]?.humidity || "50", 10),
          }));
        }

        // Get location info
        const location = data.nearest_area?.[0];

        return NextResponse.json({
          weather: {
            city: location?.areaName?.[0]?.value || location?.region?.[0]?.value || city,
            area: area || location?.region?.[0]?.value || "",
            country: location?.country?.[0]?.value || "Pakistan",
            temperature: temp,
            feels_like: feelsLike,
            humidity: humidity,
            description: description,
            wind_speed: windKmh,
            visibility: visibility,
            pressure: pressure,
            uv_index: uvIndex,
            precipitation: parseFloat(current.precipMM || "0"),
            alert_triggered: alerts.length > 0,
            alerts,
          },
          forecast: forecast,
          source: "wttr.in",
        });
      }
    }
  } catch {
    // wttr.in failed, try fallback
  }

  // Try OpenWeatherMap as secondary
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},PK&units=metric&appid=${apiKey}`,
        { next: { revalidate: 900 } }
      );

      if (response.ok) {
        const data = await response.json();
        const temp = data.main.temp;
        const alerts: string[] = [];

        if (temp >= heatThreshold) {
          alerts.push(`Heat alert: ${temp}°C — above threshold of ${heatThreshold}°C`);
        }
        if (temp <= coldThreshold) {
          alerts.push(`Cold alert: ${temp}°C — below threshold of ${coldThreshold}°C`);
        }

        return NextResponse.json({
          weather: {
            city: data.name,
            area: area || "",
            country: "Pakistan",
            temperature: Math.round(temp),
            feels_like: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            description: data.weather[0]?.description || "Unknown",
            wind_speed: Math.round(data.wind.speed * 3.6),
            visibility: Math.round((data.visibility || 10000) / 1000),
            pressure: data.main.pressure,
            uv_index: 5,
            precipitation: 0,
            alert_triggered: alerts.length > 0,
            alerts,
          },
          forecast: [],
          source: "openweathermap",
        });
      }
    } catch {
      // OpenWeatherMap failed
    }
  }

  // Return mock data as fallback
  return NextResponse.json({
    weather: {
      city: city,
      area: area || "",
      country: "Pakistan",
      temperature: 38,
      feels_like: 42,
      humidity: 55,
      description: "Partly cloudy",
      wind_speed: 15,
      visibility: 4,
      pressure: 1007,
      uv_index: 7,
      precipitation: 0,
      alert_triggered: true,
      alerts: ["Heat alert: 38°C — above threshold of 40°C"],
    },
    forecast: [
      { date: "Today", maxTemp: 40, minTemp: 28, description: "Sunny", chanceOfRain: 5, humidity: 40 },
      { date: "Tomorrow", maxTemp: 38, minTemp: 27, description: "Partly Cloudy", chanceOfRain: 10, humidity: 45 },
      { date: "Day After", maxTemp: 36, minTemp: 26, description: "Cloudy", chanceOfRain: 20, humidity: 55 },
    ],
    source: "mock",
  });
}
