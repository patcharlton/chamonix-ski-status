"use client";

import { useState } from "react";
import { WeatherStation, Lift, Piste } from "@/types/ski-data";
import {
  getStatusColour,
  getStatusBgClass,
  getLiftStatusIcon,
  formatTemp,
  getWindArrow,
  getSnowQualityLabel,
  cn,
} from "@/lib/utils";
import { LiftTypeIcon, PisteDifficultyIcon } from "./Icons";

interface DomainCardProps {
  name: string;
  weather: WeatherStation | null;
  lifts: Lift[];
  pistes: Piste[];
}

export function DomainCard({ name, weather, lifts, pistes }: DomainCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const openLifts = lifts.filter((l) => l.status === "O").length;
  const totalLifts = lifts.length;
  const status = getStatusColour(openLifts, totalLifts);

  // Count pistes by difficulty
  const pisteStats = pistes.reduce(
    (acc, p) => {
      if (p.difficulty === "V") {
        acc.green.total++;
        if (p.status === "O") acc.green.open++;
      } else if (p.difficulty === "B") {
        acc.blue.total++;
        if (p.status === "O") acc.blue.open++;
      } else if (p.difficulty === "R") {
        acc.red.total++;
        if (p.status === "O") acc.red.open++;
      } else if (p.difficulty === "N") {
        acc.black.total++;
        if (p.status === "O") acc.black.open++;
      }
      return acc;
    },
    {
      green: { open: 0, total: 0 },
      blue: { open: 0, total: 0 },
      red: { open: 0, total: 0 },
      black: { open: 0, total: 0 },
    }
  );

  const hasPistes = Object.values(pisteStats).some((s) => s.total > 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left"
      >
        {/* Top section with weather highlight */}
        {weather && (
          <div
            className="px-4 py-3 text-white"
            style={{
              background:
                (weather.temp_morning_c ?? 0) < -5
                  ? "linear-gradient(135deg, #1e3a5f 0%, #3b7cb8 100%)"
                  : "linear-gradient(135deg, #4a90c2 0%, #87c0eb 100%)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{name}</h3>
                <p className="text-white/70 text-sm">{weather.elevation_m}m</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-light">
                  {formatTemp(weather.temp_morning_c)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-white/90">
              {weather.wind_speed_kmh !== null && (
                <span>
                  {getWindArrow(weather.wind_direction)} {weather.wind_speed_kmh} km/h
                </span>
              )}
              {weather.snow_depth_cm !== null && (
                <span>❄️ {weather.snow_depth_cm}cm</span>
              )}
              {weather.snow_quality && (
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                  {getSnowQualityLabel(weather.snow_quality)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Status bar */}
        <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
          {!weather && (
            <h3 className="font-bold text-gray-900">{name}</h3>
          )}
          <div className="flex items-center gap-3">
            <span className={cn("w-3 h-3 rounded-full", getStatusBgClass(status))} />
            <span className="text-sm font-medium text-gray-700">
              {openLifts}/{totalLifts} lifts
            </span>
          </div>

          {/* Piste indicators */}
          {hasPistes && (
            <div className="flex items-center gap-2">
              {pisteStats.green.total > 0 && (
                <span className="flex items-center gap-0.5">
                  <PisteDifficultyIcon difficulty="V" size={12} />
                  <span className="text-xs text-gray-500">
                    {pisteStats.green.open}/{pisteStats.green.total}
                  </span>
                </span>
              )}
              {pisteStats.blue.total > 0 && (
                <span className="flex items-center gap-0.5">
                  <PisteDifficultyIcon difficulty="B" size={12} />
                  <span className="text-xs text-gray-500">
                    {pisteStats.blue.open}/{pisteStats.blue.total}
                  </span>
                </span>
              )}
              {pisteStats.red.total > 0 && (
                <span className="flex items-center gap-0.5">
                  <PisteDifficultyIcon difficulty="R" size={12} />
                  <span className="text-xs text-gray-500">
                    {pisteStats.red.open}/{pisteStats.red.total}
                  </span>
                </span>
              )}
              {pisteStats.black.total > 0 && (
                <span className="flex items-center gap-0.5">
                  <PisteDifficultyIcon difficulty="N" size={12} />
                  <span className="text-xs text-gray-500">
                    {pisteStats.black.open}/{pisteStats.black.total}
                  </span>
                </span>
              )}
            </div>
          )}

          <span
            className={cn(
              "text-gray-400 transition-transform ml-2",
              isExpanded && "rotate-180"
            )}
          >
            ▼
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {/* Lifts */}
          {lifts.length > 0 && (
            <div className="px-4 py-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Lifts
              </h4>
              <div className="space-y-1">
                {lifts.map((lift, idx) => {
                  const { icon, colour } = getLiftStatusIcon(lift.status);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn("text-base font-medium w-5", colour)}>
                          {icon}
                        </span>
                        <LiftTypeIcon type={lift.lift_type} className="text-gray-400 shrink-0" size={18} />
                        <span className="text-sm text-gray-900 truncate">
                          {lift.lift_name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">
                        {lift.opening_time}–{lift.closing_time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* New snow highlight */}
          {weather?.last_snowfall_cm && weather.last_snowfall_cm > 10 && (
            <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
              <span className="text-sm text-blue-700">
                🎿 +{weather.last_snowfall_cm}cm fresh snow
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
