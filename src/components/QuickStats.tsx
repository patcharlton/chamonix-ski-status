"use client";

import { CalculatedSummary, WeatherStation } from "@/types/ski-data";
import {
  Thermometer,
  Wind,
  Snowflake,
  AlertTriangle,
  ArrowUpCircle
} from "lucide-react";

interface QuickStatsProps {
  summary: CalculatedSummary;
  weather: WeatherStation[];
}

export function QuickStats({ summary, weather }: QuickStatsProps) {
  // Temperature range
  const temps = weather
    .map((w) => w.temp_morning_c)
    .filter((t): t is number => t !== null);
  const minTemp = temps.length > 0 ? Math.min(...temps) : null;

  // Snow depth
  const snowDepths = weather
    .map((w) => w.snow_depth_cm)
    .filter((d): d is number => d !== null);
  const avgSnowDepth = snowDepths.length > 0
    ? Math.round(snowDepths.reduce((a, b) => a + b, 0) / snowDepths.length)
    : null;

  // Wind
  const maxWind = Math.max(...weather.map(w => w.wind_speed_kmh ?? 0));

  // Avalanche risk
  const avalancheRisk = Math.max(...weather.map((w) => w.avalanche_risk ?? 0));

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2 mb-4 -mx-1 px-1">
      {/* Lifts */}
      <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shrink-0">
        <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-semibold text-gray-900">
          {summary.lifts_open}/{summary.lifts_total}
        </span>
        <span className="text-xs text-gray-500">lifts</span>
      </div>

      {/* Temperature */}
      {minTemp !== null && (
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shrink-0">
          <Thermometer className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold text-gray-900">{minTemp}°</span>
        </div>
      )}

      {/* Snow Depth */}
      {avgSnowDepth !== null && avgSnowDepth > 0 && (
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shrink-0">
          <Snowflake className="w-4 h-4 text-cyan-500" />
          <span className="text-sm font-semibold text-gray-900">{avgSnowDepth}cm</span>
        </div>
      )}

      {/* Wind (only show if notable) */}
      {maxWind > 20 && (
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shrink-0">
          <Wind className={`w-4 h-4 ${maxWind > 40 ? 'text-amber-500' : 'text-gray-500'}`} />
          <span className="text-sm font-semibold text-gray-900">{maxWind}km/h</span>
        </div>
      )}

      {/* Avalanche Risk (only show if elevated) */}
      {avalancheRisk >= 3 && (
        <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 shrink-0 ${
          avalancheRisk >= 4
            ? 'bg-red-50 border border-red-200'
            : 'bg-amber-50 border border-amber-200'
        }`}>
          <AlertTriangle className={`w-4 h-4 ${
            avalancheRisk >= 4 ? 'text-red-500' : 'text-amber-500'
          }`} />
          <span className={`text-sm font-semibold ${
            avalancheRisk >= 4 ? 'text-red-700' : 'text-amber-700'
          }`}>
            {avalancheRisk}/5
          </span>
        </div>
      )}
    </div>
  );
}
