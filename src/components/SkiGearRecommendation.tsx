"use client";

import { useState, useMemo } from "react";
import { WeatherStation } from "@/types/ski-data";

interface SkiGearRecommendationProps {
  weather: WeatherStation[];
}

type SkierLevel = "beginner" | "intermediate" | "expert";
type TerrainType = "piste" | "off-piste" | "mixed" | "park";
type OwnershipType = "rental" | "owns";

interface SkiRecommendation {
  category: string;
  waistWidth: string;
  reasoning: string[];
  tips: string[];
  confidence: "high" | "medium" | "low";
}

function analyzeConditions(weather: WeatherStation[]) {
  // Get the most representative station (mid-mountain)
  const sortedByElevation = [...weather].sort((a, b) => b.elevation_m - a.elevation_m);
  const midStation = sortedByElevation[Math.floor(sortedByElevation.length / 2)] || weather[0];

  // Aggregate conditions
  const avgTemp = weather.reduce((sum, w) => sum + (w.temp_morning_c ?? 0), 0) / weather.length;
  const maxWind = Math.max(...weather.map(w => w.wind_speed_kmh ?? 0));
  const freshSnow = Math.max(...weather.map(w => w.last_snowfall_cm ?? 0));
  const snowQuality = midStation?.snow_quality ?? "UNKNOWN";
  const avgSnowDepth = weather.reduce((sum, w) => sum + (w.snow_depth_cm ?? 0), 0) / weather.length;

  // Determine base conditions
  let baseConditions: "powder" | "packed" | "icy" | "slush" | "variable" = "packed";
  if (snowQuality === "FRAICHE" && freshSnow > 15) {
    baseConditions = "powder";
  } else if (snowQuality === "HUMIDE" || avgTemp > 2) {
    baseConditions = "slush";
  } else if (avgTemp < -10 && snowQuality !== "FRAICHE") {
    baseConditions = "icy";
  } else if (snowQuality === "TRANSFORMÉE") {
    baseConditions = "variable";
  }

  // Determine visibility (estimate from weather)
  let visibility: "clear" | "flat-light" | "whiteout" = "clear";
  if (maxWind > 60) {
    visibility = "whiteout";
  } else if (maxWind > 35) {
    visibility = "flat-light";
  }

  // Determine wind level
  let windLevel: "calm" | "moderate" | "strong" = "calm";
  if (maxWind > 50) {
    windLevel = "strong";
  } else if (maxWind > 25) {
    windLevel = "moderate";
  }

  return {
    freshSnow,
    baseConditions,
    temperature: Math.round(avgTemp),
    visibility,
    windLevel,
    snowDepth: Math.round(avgSnowDepth),
    snowQuality,
  };
}

function generateRecommendation(
  conditions: ReturnType<typeof analyzeConditions>,
  terrain: TerrainType,
  level: SkierLevel,
  ownership: OwnershipType
): SkiRecommendation {
  let category = "";
  let waistWidth = "";
  const reasoning: string[] = [];
  const tips: string[] = [];
  let confidence: "high" | "medium" | "low" = "high";

  // Base recommendation on conditions and terrain
  if (conditions.baseConditions === "powder" && conditions.freshSnow > 20) {
    // Deep powder conditions
    if (terrain === "off-piste" || terrain === "mixed") {
      category = "Powder/Freeride Skis";
      waistWidth = "105-120mm";
      reasoning.push(`${conditions.freshSnow}cm of fresh snow calls for flotation`);
      reasoning.push("Wide waist prevents sinking in deep snow");
      reasoning.push("Rockered tips help initiate turns in powder");
      tips.push("Keep your weight centered and let the skis float");
      tips.push("Make wider, more flowing turns than on piste");
    } else {
      category = "All-Mountain Wide";
      waistWidth = "95-105mm";
      reasoning.push("Fresh snow on piste benefits from extra width");
      reasoning.push("Versatile enough for groomed and light powder");
      tips.push("Enjoy the soft snow before it gets tracked out");
    }
  } else if (conditions.baseConditions === "icy") {
    // Hard/icy conditions
    category = "Carving/Piste Skis";
    waistWidth = "68-80mm";
    reasoning.push("Narrow waist provides better edge grip on hard snow");
    reasoning.push("Stiffer construction handles icy patches");
    reasoning.push("Quick edge-to-edge transitions for control");
    tips.push("Keep edges sharp - consider a tune before skiing");
    tips.push("Stay on groomed runs where possible");
    tips.push("Reduce speed on shaded icy sections");
    confidence = "high";
  } else if (conditions.baseConditions === "slush") {
    // Spring/warm conditions
    category = "All-Mountain";
    waistWidth = "85-95mm";
    reasoning.push("Medium width handles variable spring snow");
    reasoning.push("Softer flex works better in warm, soft snow");
    tips.push("Ski early - conditions deteriorate after midday");
    tips.push("Avoid flat sections where slush will slow you down");
    tips.push("Stay north-facing for better snow preservation");
  } else if (terrain === "park") {
    // Park skiing
    category = "Park/Freestyle Skis";
    waistWidth = "85-95mm";
    reasoning.push("Twin tips essential for switch skiing");
    reasoning.push("Medium flex absorbs landing impacts");
    reasoning.push("Centered mount for balanced spins");
    tips.push("Start small and work up to bigger features");
    tips.push("Check jump takeoffs before hitting them");
  } else {
    // Default all-mountain recommendation
    if (terrain === "off-piste" || terrain === "mixed") {
      category = "All-Mountain Wide";
      waistWidth = "90-100mm";
      reasoning.push("Versatile for both groomed and ungroomed terrain");
      reasoning.push(`${conditions.snowDepth}cm base allows off-piste exploration`);
    } else {
      category = "All-Mountain";
      waistWidth = "80-90mm";
      reasoning.push("Perfect balance of edge grip and versatility");
      reasoning.push("Handles variable conditions throughout the day");
    }

    if (conditions.baseConditions === "variable") {
      tips.push("Conditions change with elevation - adapt your technique");
    }
  }

  // Adjust for skill level
  if (level === "beginner") {
    reasoning.push("Shorter length (chin height) for easier control");
    tips.push("Stick to green and blue runs to build confidence");
    if (ownership === "rental") {
      tips.push("Ask the rental shop to set DIN bindings appropriately");
    }
    confidence = "medium";
  } else if (level === "intermediate") {
    reasoning.push("Standard length (nose to forehead) for progression");
    if (terrain === "off-piste") {
      tips.push("Consider a guided introduction to off-piste");
      confidence = "medium";
    }
  } else {
    reasoning.push("Full length for stability at speed");
  }

  // Rental-specific advice
  if (ownership === "rental") {
    tips.push(`Request "${category}" category at the rental shop`);
    tips.push("Test the bindings release before heading out");
  }

  // Weather-specific tips
  if (conditions.windLevel === "strong") {
    tips.push("Strong winds today - lower terrain may be more enjoyable");
    confidence = conditions.visibility === "whiteout" ? "low" : "medium";
  }

  if (conditions.visibility === "flat-light") {
    tips.push("Flat light expected - wear contrast-enhancing goggles (orange/pink lens)");
  }

  return { category, waistWidth, reasoning, tips, confidence };
}

export function SkiGearRecommendation({ weather }: SkiGearRecommendationProps) {
  const [terrain, setTerrain] = useState<TerrainType>("piste");
  const [level, setLevel] = useState<SkierLevel>("intermediate");
  const [ownership, setOwnership] = useState<OwnershipType>("rental");
  const [isExpanded, setIsExpanded] = useState(false);

  const conditions = useMemo(() => analyzeConditions(weather), [weather]);
  const recommendation = useMemo(
    () => generateRecommendation(conditions, terrain, level, ownership),
    [conditions, terrain, level, ownership]
  );

  const conditionBadgeColor = {
    powder: "bg-blue-100 text-blue-800",
    packed: "bg-gray-100 text-gray-800",
    icy: "bg-cyan-100 text-cyan-800",
    slush: "bg-amber-100 text-amber-800",
    variable: "bg-purple-100 text-purple-800",
  };

  const confidenceColor = {
    high: "text-green-600",
    medium: "text-amber-600",
    low: "text-red-600",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎿</span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">AI Ski Recommendation</h3>
            <p className="text-sm text-gray-500">
              {recommendation.category} • {recommendation.waistWidth}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Current conditions summary */}
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${conditionBadgeColor[conditions.baseConditions]}`}>
              {conditions.baseConditions}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              {conditions.temperature}°C
            </span>
            {conditions.freshSnow > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                +{conditions.freshSnow}cm fresh
              </span>
            )}
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              {conditions.windLevel} wind
            </span>
          </div>

          {/* User preferences */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Terrain</label>
              <select
                value={terrain}
                onChange={(e) => setTerrain(e.target.value as TerrainType)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
              >
                <option value="piste">Piste</option>
                <option value="off-piste">Off-piste</option>
                <option value="mixed">Mixed</option>
                <option value="park">Park</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as SkierLevel)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Skis</label>
              <select
                value={ownership}
                onChange={(e) => setOwnership(e.target.value as OwnershipType)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
              >
                <option value="rental">Renting</option>
                <option value="owns">Own skis</option>
              </select>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-bold text-gray-900">{recommendation.category}</h4>
                <p className="text-sm text-indigo-600 font-medium">{recommendation.waistWidth} waist</p>
              </div>
              <span className={`text-xs font-medium ${confidenceColor[recommendation.confidence]}`}>
                {recommendation.confidence} confidence
              </span>
            </div>

            {/* Reasoning */}
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Why this ski?</p>
              <ul className="space-y-1">
                {recommendation.reasoning.map((reason, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            {recommendation.tips.length > 0 && (
              <div className="mt-3 pt-3 border-t border-indigo-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Tips for today</p>
                <ul className="space-y-1">
                  {recommendation.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-amber-500">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
