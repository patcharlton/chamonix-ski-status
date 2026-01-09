"use client";

import { useState, useMemo } from "react";
import { WeatherStation } from "@/types/ski-data";

interface SkiGearRecommendationProps {
  weather: WeatherStation[];
}

interface SkiRecommendation {
  category: string;
  waistWidth: string;
  profile: string;
  reasoning: string[];
  tips: string[];
}

interface ChamonixConditions {
  freshSnow24h: number;
  freshSnow48h: number;
  hoursSinceSnowfall: number;
  baseCondition: "powder" | "packed" | "groomed" | "icy" | "spring" | "variable";
  avgTemperature: number;
  maxWind: number;
  visibility: "clear" | "flat_light" | "whiteout";
  snowDepth: number;
  avalancheRisk: number;
  isPowderDay: boolean;
}

function analyzeConditions(weather: WeatherStation[]): ChamonixConditions {
  const sortedByElevation = [...weather].sort((a, b) => b.elevation_m - a.elevation_m);
  const midStation = sortedByElevation[Math.floor(sortedByElevation.length / 2)];
  const avgTemp = weather.reduce((sum, w) => sum + (w.temp_morning_c ?? 0), 0) / weather.length;
  const maxWind = Math.max(...weather.map(w => w.wind_speed_kmh ?? 0));
  const freshSnow = midStation?.last_snowfall_cm ?? 0;
  const snowQuality = midStation?.snow_quality ?? "UNKNOWN";
  const avgSnowDepth = weather.reduce((sum, w) => sum + (w.snow_depth_cm ?? 0), 0) / weather.length;
  const avalancheRisk = Math.max(...weather.map(w => w.avalanche_risk ?? 0));

  // Estimate hours since snowfall
  const today = new Date().toLocaleDateString('fr-FR');
  const lastSnowDate = midStation?.last_snowfall_date;
  let hoursSinceSnowfall = 72;
  if (lastSnowDate === today) {
    hoursSinceSnowfall = 12;
  } else if (lastSnowDate) {
    const parts = lastSnowDate.split('/');
    if (parts.length === 3) {
      const snowDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      hoursSinceSnowfall = Math.floor((Date.now() - snowDate.getTime()) / (1000 * 60 * 60));
    }
  }

  // Determine base condition
  let baseCondition: ChamonixConditions["baseCondition"] = "groomed";
  const isPowderDay = snowQuality === "FRAICHE" && freshSnow > 15 && hoursSinceSnowfall < 48;

  if (isPowderDay) {
    baseCondition = "powder";
  } else if (snowQuality === "FRAICHE" && freshSnow > 5) {
    baseCondition = "packed";
  } else if (snowQuality === "HUMIDE" || avgTemp > 2) {
    baseCondition = "spring";
  } else if (avgTemp < -8 && snowQuality !== "FRAICHE") {
    baseCondition = "icy";
  } else if (snowQuality === "TRANSFORMÉE" || snowQuality === "CROUTE") {
    baseCondition = "variable";
  }

  // Visibility
  let visibility: ChamonixConditions["visibility"] = "clear";
  if (maxWind > 50 || (freshSnow > 20 && hoursSinceSnowfall < 6)) {
    visibility = "whiteout";
  } else if (maxWind > 30) {
    visibility = "flat_light";
  }

  return {
    freshSnow24h: hoursSinceSnowfall < 24 ? freshSnow : 0,
    freshSnow48h: hoursSinceSnowfall < 48 ? freshSnow : 0,
    hoursSinceSnowfall,
    baseCondition,
    avgTemperature: Math.round(avgTemp),
    maxWind,
    visibility,
    snowDepth: Math.round(avgSnowDepth),
    avalancheRisk,
    isPowderDay,
  };
}

function getOnPisteRecommendation(conditions: ChamonixConditions): SkiRecommendation {
  let width = 82;
  let category = "Carving/Piste";
  let profile = "Full camber or minimal tip rocker";
  const reasoning: string[] = [];
  const tips: string[] = [];

  // Adjust for conditions
  if (conditions.baseCondition === "icy") {
    width = 75;
    category = "Race/Carving";
    reasoning.push("Narrow waist for maximum edge grip on hard snow");
    reasoning.push("Full camber essential for icy conditions");
    tips.push("Sharp edges are critical - get a tune");
  } else if (conditions.baseCondition === "powder" || conditions.freshSnow24h > 10) {
    width = 88;
    category = "All-Mountain";
    profile = "Camber with tip rocker";
    reasoning.push("Extra width helps on ungroomed sections");
    reasoning.push(`${conditions.freshSnow24h}cm fresh - some powder on edges of pistes`);
  } else if (conditions.baseCondition === "spring") {
    width = 85;
    category = "All-Mountain";
    reasoning.push("Medium width handles soft spring snow");
    tips.push("Ski early before snow gets heavy");
    tips.push("Apply warm-weather wax");
  } else {
    reasoning.push("Standard piste ski for groomed conditions");
    reasoning.push("Camber provides edge grip and energy");
  }

  // Chamonix modifier
  width -= 5;
  reasoning.push("Chamonix maritime snow is denser than continental");

  // Temperature adjustment
  if (conditions.avgTemperature < -10) {
    tips.push(`Cold day (${conditions.avgTemperature}°C) - dress warm, snow will be fast`);
  }

  // Visibility
  if (conditions.visibility === "flat_light") {
    tips.push("Flat light - use orange/yellow lens goggles");
  }

  const widthMin = width - 3;
  const widthMax = width + 3;

  return {
    category,
    waistWidth: `${widthMin}-${widthMax}mm`,
    profile,
    reasoning,
    tips,
  };
}

function getOffPisteRecommendation(conditions: ChamonixConditions): SkiRecommendation {
  let width = 98;
  let category = "All-Mountain Wide";
  let profile = "Rocker-camber-rocker";
  const reasoning: string[] = [];
  const tips: string[] = [];

  // Adjust for conditions
  if (conditions.isPowderDay && conditions.freshSnow24h >= 30) {
    width = 110;
    category = "Powder";
    profile = "Heavy rocker (20%+ tip/tail)";
    reasoning.push(`${conditions.freshSnow24h}cm fresh powder - go wide!`);
    reasoning.push("Full rocker for maximum flotation");
    tips.push("First lifts for untracked lines");
  } else if (conditions.isPowderDay || conditions.freshSnow24h >= 15) {
    width = 105;
    category = "Freeride";
    reasoning.push(`${conditions.freshSnow48h}cm recent snow - freeride width ideal`);
    reasoning.push("Rocker-camber-rocker balances float and edge grip");
  } else if (conditions.hoursSinceSnowfall > 48) {
    width = 95;
    category = "All-Mountain";
    reasoning.push("Snow has settled - moderate width sufficient");
    reasoning.push("Powder transforms in 24-48h in Chamonix");
    tips.push("Best remaining powder above 2500m on north faces");
  } else if (conditions.baseCondition === "spring") {
    width = 95;
    category = "All-Mountain";
    reasoning.push("Spring conditions - versatile width for variable snow");
    tips.push("Follow the sun - east AM, south midday, west PM");
  } else {
    reasoning.push("Standard off-piste width for mixed conditions");
  }

  // Chamonix modifier
  width -= 5;
  reasoning.push("Chamonix maritime snow provides good flotation");

  // Safety warnings
  if (conditions.avalancheRisk >= 4) {
    tips.push("⚠️ High avalanche risk (4/5) - stay on marked runs");
  } else if (conditions.avalancheRisk === 3) {
    tips.push("Considerable avalanche risk - careful route selection");
  }

  if (conditions.maxWind > 40) {
    tips.push("Strong winds - avoid exposed ridges, wind slab risk");
  } else if (conditions.maxWind > 25) {
    tips.push("Moderate wind - check lee slopes for wind slab");
  }

  if (conditions.visibility === "whiteout") {
    tips.push("Poor visibility - consider staying on-piste today");
  }

  const widthMin = width - 3;
  const widthMax = width + 3;

  return {
    category,
    waistWidth: `${widthMin}-${widthMax}mm`,
    profile,
    reasoning,
    tips,
  };
}

export function SkiGearRecommendation({ weather }: SkiGearRecommendationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const conditions = useMemo(() => analyzeConditions(weather), [weather]);
  const onPiste = useMemo(() => getOnPisteRecommendation(conditions), [conditions]);
  const offPiste = useMemo(() => getOffPisteRecommendation(conditions), [conditions]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4 shadow-sm">
      {/* Compact Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🎿</span>
          <div className="text-left">
            <h3 className="font-medium text-gray-900 text-sm">Ski Selection</h3>
            <p className="text-xs text-gray-500">
              Piste: {onPiste.waistWidth} • Off-piste: {offPiste.waistWidth}
            </p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <>
          <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
            {/* On-Piste */}
            <div className="p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">🎿</span>
                <h4 className="font-medium text-gray-800 text-sm">On-Piste</h4>
              </div>
              <p className="text-sm font-medium text-indigo-600">{onPiste.category}</p>
              <p className="text-xs text-gray-500 mb-2">{onPiste.waistWidth} • {onPiste.profile}</p>
              {onPiste.reasoning.slice(0, 2).map((r, i) => (
                <p key={i} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-indigo-400">•</span>{r}
                </p>
              ))}
            </div>

            {/* Off-Piste */}
            <div className="p-3 bg-slate-50">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">⛷️</span>
                <h4 className="font-medium text-gray-800 text-sm">Off-Piste</h4>
              </div>
              <p className="text-sm font-medium text-indigo-600">{offPiste.category}</p>
              <p className="text-xs text-gray-500 mb-2">{offPiste.waistWidth} • {offPiste.profile}</p>
              {offPiste.reasoning.slice(0, 2).map((r, i) => (
                <p key={i} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-indigo-400">•</span>{r}
                </p>
              ))}
            </div>
          </div>

          {/* Tips row */}
          {(onPiste.tips.length > 0 || offPiste.tips.length > 0) && (
            <div className="px-3 py-2 bg-amber-50 border-t border-amber-100">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {[...onPiste.tips.slice(0, 1), ...offPiste.tips.slice(0, 1)].map((tip, i) => (
                  <p key={i} className="text-xs text-amber-700 flex items-center gap-1">
                    <span>{tip.startsWith('⚠️') ? '' : '💡'}</span>{tip}
                  </p>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
