"use client";

import { useState, useMemo } from "react";
import { WeatherStation } from "@/types/ski-data";

interface SkiGearRecommendationProps {
  weather: WeatherStation[];
}

type SkierLevel = "beginner" | "intermediate" | "advanced" | "expert";
type TerrainType = "piste" | "off-piste" | "mixed" | "park";
type OwnershipType = "rental" | "owns";

interface SkiRecommendation {
  category: string;
  waistWidth: string;
  waistMm: number;
  profile: string;
  length: string;
  reasoning: string[];
  tips: string[];
  areaRecommendation: string;
  timingAdvice: string | null;
  confidence: "high" | "medium" | "low";
}

interface ChamonixConditions {
  freshSnow24h: number;
  freshSnow48h: number;
  hoursSnceSnowfall: number;
  baseCondition: "icy" | "groomed" | "packed_powder" | "powder" | "wet_spring" | "variable";
  avgTemperature: number;
  maxWind: number;
  windDirection: string | null;
  visibility: "clear" | "flat_light" | "whiteout";
  snowDepth: number;
  snowQuality: string;
  avalancheRisk: number;
  foehnActive: boolean;
  targetAltitude: number;
  isSpring: boolean;
  cornConditions: boolean;
}

function analyzeConditions(weather: WeatherStation[]): ChamonixConditions {
  // Get stations by altitude for gradient analysis
  const sortedByElevation = [...weather].sort((a, b) => b.elevation_m - a.elevation_m);
  const midStation = sortedByElevation[Math.floor(sortedByElevation.length / 2)];
  const lowStation = sortedByElevation[sortedByElevation.length - 1];

  // Temperature analysis
  const avgTemp = weather.reduce((sum, w) => sum + (w.temp_morning_c ?? 0), 0) / weather.length;
  const maxWind = Math.max(...weather.map(w => w.wind_speed_kmh ?? 0));

  // Snow analysis - use mid-mountain as representative
  const freshSnow = midStation?.last_snowfall_cm ?? 0;
  const snowQuality = midStation?.snow_quality ?? "UNKNOWN";
  const avgSnowDepth = weather.reduce((sum, w) => sum + (w.snow_depth_cm ?? 0), 0) / weather.length;
  const avalancheRisk = Math.max(...weather.map(w => w.avalanche_risk ?? 0));

  // Estimate hours since snowfall (if date matches today, assume recent)
  const today = new Date().toLocaleDateString('fr-FR');
  const lastSnowDate = midStation?.last_snowfall_date;
  let hoursSinceSnowfall = 72; // Default to old snow
  if (lastSnowDate === today) {
    hoursSinceSnowfall = 12; // Today's snow
  } else if (lastSnowDate) {
    // Parse French date format dd/mm/yyyy
    const parts = lastSnowDate.split('/');
    if (parts.length === 3) {
      const snowDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      const now = new Date();
      hoursSinceSnowfall = Math.floor((now.getTime() - snowDate.getTime()) / (1000 * 60 * 60));
    }
  }

  // Determine base conditions using Chamonix maritime snow rules
  let baseCondition: ChamonixConditions["baseCondition"] = "groomed";

  if (snowQuality === "FRAICHE" && freshSnow > 15 && hoursSinceSnowfall < 48) {
    baseCondition = "powder";
  } else if (snowQuality === "FRAICHE" && freshSnow > 5) {
    baseCondition = "packed_powder";
  } else if (snowQuality === "HUMIDE" || avgTemp > 2) {
    baseCondition = "wet_spring";
  } else if (avgTemp < -8 && snowQuality !== "FRAICHE") {
    baseCondition = "icy";
  } else if (snowQuality === "TRANSFORMÉE" || snowQuality === "CROUTE") {
    baseCondition = "variable";
  }

  // Visibility estimation
  let visibility: ChamonixConditions["visibility"] = "clear";
  if (maxWind > 50 || (freshSnow > 20 && hoursSinceSnowfall < 6)) {
    visibility = "whiteout";
  } else if (maxWind > 30) {
    visibility = "flat_light";
  }

  // Foehn detection (south wind + rapid warming)
  const windDir = midStation?.wind_direction?.toUpperCase() ?? "";
  const foehnActive = (windDir.includes("SUD") || windDir === "S") && avgTemp > 0;

  // Spring/corn conditions
  const month = new Date().getMonth();
  const isSpring = month >= 2 && month <= 4; // March-May
  const cornConditions = isSpring && avgTemp > 0 && (lowStation?.temp_morning_c ?? 0) < 0;

  // Default target altitude (mid-mountain)
  const targetAltitude = 2000;

  return {
    freshSnow24h: hoursSinceSnowfall < 24 ? freshSnow : 0,
    freshSnow48h: hoursSinceSnowfall < 48 ? freshSnow : 0,
    hoursSnceSnowfall: hoursSinceSnowfall,
    baseCondition,
    avgTemperature: Math.round(avgTemp),
    maxWind,
    windDirection: midStation?.wind_direction ?? null,
    visibility,
    snowDepth: Math.round(avgSnowDepth),
    snowQuality,
    avalancheRisk,
    foehnActive,
    targetAltitude,
    isSpring,
    cornConditions,
  };
}

function calculateSkiWidth(
  conditions: ChamonixConditions,
  terrain: TerrainType,
  level: SkierLevel
): { width: number; category: string } {
  let baseWidth = 88; // All-mountain core as Chamonix default
  let category = "All-Mountain Core";

  // STEP 1: Base condition assessment
  if (conditions.baseCondition === "icy") {
    baseWidth = 78;
    category = "Carving/Piste";
  } else if (conditions.baseCondition === "groomed") {
    baseWidth = 82;
    category = "Carving/Piste";
  } else if (conditions.baseCondition === "packed_powder") {
    baseWidth = 92;
    category = "All-Mountain Core";
  } else if (conditions.baseCondition === "powder") {
    baseWidth = 105;
    category = "Freeride";
  } else if (conditions.baseCondition === "wet_spring") {
    baseWidth = 88;
    category = "All-Mountain Core";
  }

  // STEP 2: Fresh snow depth adjustment (Chamonix thresholds)
  if (conditions.freshSnow24h >= 5 && conditions.freshSnow24h < 15) {
    baseWidth = Math.max(baseWidth, 88);
    category = baseWidth >= 92 ? "All-Mountain Core" : category;
  }
  if (conditions.freshSnow24h >= 15 && conditions.freshSnow24h < 30) {
    baseWidth = Math.max(baseWidth, 100);
    category = "Freeride";
  }
  if (conditions.freshSnow24h >= 30 && conditions.freshSnow24h < 40) {
    baseWidth = Math.max(baseWidth, 110);
    category = "Powder";
  }
  if (conditions.freshSnow24h >= 40) {
    baseWidth = Math.max(baseWidth, 115);
    category = "Wide Powder";
  }

  // STEP 3: Chamonix regional modifier (-5mm for maritime snow)
  baseWidth -= 5;

  // STEP 4: Temperature modifier
  if (conditions.avgTemperature < -10) {
    baseWidth += 5; // Dry champagne powder needs more flotation
  } else if (conditions.avgTemperature >= -5 && conditions.avgTemperature < 0) {
    baseWidth -= 5; // Denser snow = less width needed
  }

  // STEP 5: Powder age modifier (Chamonix-specific 48h window)
  if (conditions.hoursSnceSnowfall > 48 && conditions.targetAltitude < 2500) {
    baseWidth -= 5; // Snow has transformed at lower altitudes
    if (category === "Powder") category = "Freeride";
    if (category === "Freeride") category = "All-Mountain Core";
  }

  // STEP 6: Wind modifier
  if (conditions.maxWind > 25 && conditions.freshSnow48h > 10) {
    baseWidth -= 5; // Denser wind-affected snow
  }

  // STEP 7: Visibility constraints
  if (conditions.visibility === "flat_light" || conditions.visibility === "whiteout") {
    baseWidth -= 5; // Narrower for control
  }

  // STEP 8: Terrain preference adjustment
  if (terrain === "piste") {
    baseWidth = Math.min(baseWidth, 90);
    if (baseWidth <= 85) category = "Carving/Piste";
  } else if (terrain === "off-piste" && conditions.baseCondition !== "icy") {
    baseWidth = Math.max(baseWidth, 95);
  } else if (terrain === "park") {
    baseWidth = Math.max(85, Math.min(baseWidth, 95));
    category = "Park/Freestyle";
  }

  // STEP 9: Skill level adjustment
  if (level === "beginner") {
    baseWidth = Math.min(baseWidth, 85);
    category = "All-Mountain Narrow";
  }

  // Ensure within bounds
  baseWidth = Math.max(68, Math.min(baseWidth, 125));

  return { width: baseWidth, category };
}

function getProfile(width: number): string {
  // Chamonix-specific: prioritize camber underfoot for morning hardpack
  if (width < 85) {
    return "Full camber or minimal tip rocker";
  } else if (width < 95) {
    return "Camber with tip rocker (5-15%)";
  } else if (width < 105) {
    return "Rocker-camber-rocker (15-20% tip, 10% tail)";
  } else {
    return "Aggressive rocker (20-30% tip, 15-20% tail)";
  }
}

function getAreaRecommendation(conditions: ChamonixConditions, terrain: TerrainType): string {
  if (conditions.visibility === "whiteout" || conditions.visibility === "flat_light") {
    return "Les Houches (tree skiing for definition)";
  }

  if (conditions.baseCondition === "powder" && terrain !== "piste") {
    return "Grands Montets (best off-piste access)";
  }

  if (conditions.cornConditions) {
    return "Brévent south faces (follow the corn)";
  }

  if (conditions.baseCondition === "icy" || conditions.baseCondition === "groomed") {
    return "Brévent-Flégère or Les Houches (great groomers)";
  }

  if (conditions.foehnActive) {
    return "Sheltered north aspects (avoid wind-loaded south faces)";
  }

  return "Brévent-Flégère (versatile conditions)";
}

function getTimingAdvice(conditions: ChamonixConditions): string | null {
  if (conditions.cornConditions) {
    return "Optimal corn window: 10:30-12:30. Start on east aspects, rotate to south by noon.";
  }

  if (conditions.baseCondition === "wet_spring") {
    return "Ski early - conditions deteriorate after midday. North-facing terrain preserves quality.";
  }

  if (conditions.baseCondition === "powder" && conditions.hoursSnceSnowfall < 24) {
    return "First lift for untracked powder! Powder transforms within 24-48h in Chamonix's maritime climate.";
  }

  if (conditions.foehnActive) {
    return "Foehn conditions: Snow deteriorating rapidly. Morning skiing recommended.";
  }

  return null;
}

function generateRecommendation(
  conditions: ChamonixConditions,
  terrain: TerrainType,
  level: SkierLevel,
  ownership: OwnershipType,
  height: number
): SkiRecommendation {
  const { width, category } = calculateSkiWidth(conditions, terrain, level);
  const profile = getProfile(width);
  const areaRecommendation = getAreaRecommendation(conditions, terrain);
  const timingAdvice = getTimingAdvice(conditions);

  const reasoning: string[] = [];
  const tips: string[] = [];
  let confidence: SkiRecommendation["confidence"] = "high";

  // Width range (±3mm per framework)
  const widthMin = width - 3;
  const widthMax = width + 3;
  const waistWidth = `${widthMin}-${widthMax}mm`;

  // Length calculation
  let baseLength = height;
  if (level === "beginner") {
    baseLength = height - 12;
    reasoning.push("Shorter length (chin height) for easier turn initiation");
  } else if (level === "intermediate") {
    baseLength = height - 7;
    reasoning.push("Standard length (nose to forehead) for progression");
  } else if (level === "advanced") {
    baseLength = height - 2;
    reasoning.push("Full length for stability at speed");
  } else {
    baseLength = height + 2;
    reasoning.push("Expert length for maximum stability and power");
  }

  // Length adjustments per framework
  if (terrain === "piste") baseLength -= 5;
  if (terrain === "off-piste" || conditions.baseCondition === "powder") baseLength += 5;
  if (profile.includes("Aggressive rocker") || profile.includes("rocker-camber-rocker")) baseLength += 3;

  const lengthMin = baseLength - 3;
  const lengthMax = baseLength + 3;
  const length = `${lengthMin}-${lengthMax}cm`;

  // Build reasoning based on conditions
  if (conditions.freshSnow24h > 20) {
    reasoning.push(`${conditions.freshSnow24h}cm fresh snow in last 24h calls for flotation`);
  } else if (conditions.freshSnow48h > 15) {
    reasoning.push(`${conditions.freshSnow48h}cm recent snow (settling) - good powder remains above 2500m`);
  }

  reasoning.push("Chamonix's maritime snow is ~5mm denser than Rocky Mountain powder");

  if (conditions.avgTemperature < -10) {
    reasoning.push(`Cold temps (${conditions.avgTemperature}°C) = light dry powder needing extra width`);
  } else if (conditions.avgTemperature > 0) {
    reasoning.push(`Warm temps (${conditions.avgTemperature}°C) = denser snow requiring less width`);
  }

  if (conditions.baseCondition === "icy") {
    reasoning.push("Narrow waist provides better edge grip on hard-packed snow");
    tips.push("Keep edges sharp - consider a tune before skiing");
  }

  // Chamonix-specific tips
  if (conditions.baseCondition === "powder" && conditions.hoursSnceSnowfall < 48) {
    tips.push("Chamonix powder transforms in 24-48h (faster than continental climates)");
    tips.push("North-facing terrain above 2500m holds powder longest");
  }

  if (conditions.visibility === "flat_light") {
    tips.push("Flat light: wear contrast-enhancing goggles (orange/pink lens, 40-60% VLT)");
    confidence = "medium";
  }

  if (conditions.visibility === "whiteout") {
    tips.push("Whiteout conditions: stick to groomed/marked runs only");
    tips.push("Les Houches has the only significant tree skiing in Chamonix");
    confidence = "low";
  }

  if (conditions.maxWind > 40) {
    tips.push("Strong winds - lower terrain may be more enjoyable");
    tips.push("Avoid exposed ridges and lee slopes (wind slab risk)");
    confidence = "medium";
  } else if (conditions.maxWind > 25) {
    tips.push("Moderate wind - avoid lee slopes where wind slabs form");
  }

  if (conditions.foehnActive) {
    tips.push("Foehn wind active: expect rapid snow deterioration, elevated avalanche risk");
    tips.push("Stick to north aspects and sheltered terrain");
    confidence = "medium";
  }

  if (conditions.avalancheRisk >= 4) {
    tips.push("High avalanche risk (4/5) - stay on marked pistes");
    if (terrain === "off-piste") confidence = "low";
  } else if (conditions.avalancheRisk === 3) {
    tips.push("Considerable avalanche risk - exercise caution off-piste");
  }

  if (conditions.cornConditions) {
    tips.push("Corn snow timing: east aspects before 10:30, south 10:30-12:30, west early afternoon");
    tips.push("Return to base by 14:00 - wet avalanche risk rises in afternoon");
  }

  if (conditions.baseCondition === "wet_spring") {
    tips.push("Apply spring/warm weather wax for best glide");
    tips.push("Avoid flat sections where slush will slow you down");
  }

  // Rental-specific
  if (ownership === "rental") {
    tips.push(`Request "${category}" category at the rental shop`);
    tips.push("Ask for waist width around " + width + "mm");
    if (level === "beginner") {
      tips.push("Ask staff to set DIN bindings appropriately for your weight/level");
    }
  }

  // Chamonix one-ski quiver note
  if (width >= 96 && width <= 102 && terrain === "mixed") {
    reasoning.push("This is the Chamonix 'one-ski quiver' sweet spot (96-102mm)");
  }

  return {
    category,
    waistWidth,
    waistMm: width,
    profile,
    length,
    reasoning,
    tips,
    areaRecommendation,
    timingAdvice,
    confidence,
  };
}

export function SkiGearRecommendation({ weather }: SkiGearRecommendationProps) {
  const [terrain, setTerrain] = useState<TerrainType>("mixed");
  const [level, setLevel] = useState<SkierLevel>("intermediate");
  const [ownership, setOwnership] = useState<OwnershipType>("rental");
  const [height, setHeight] = useState(175);
  const [isExpanded, setIsExpanded] = useState(false);

  const conditions = useMemo(() => analyzeConditions(weather), [weather]);
  const recommendation = useMemo(
    () => generateRecommendation(conditions, terrain, level, ownership, height),
    [conditions, terrain, level, ownership, height]
  );

  const conditionBadgeColor: Record<string, string> = {
    powder: "bg-blue-100 text-blue-800",
    packed_powder: "bg-sky-100 text-sky-800",
    groomed: "bg-gray-100 text-gray-800",
    icy: "bg-cyan-100 text-cyan-800",
    wet_spring: "bg-amber-100 text-amber-800",
    variable: "bg-purple-100 text-purple-800",
  };

  const confidenceColor = {
    high: "text-green-600",
    medium: "text-amber-600",
    low: "text-red-600",
  };

  const conditionLabels: Record<string, string> = {
    powder: "Powder",
    packed_powder: "Packed Powder",
    groomed: "Groomed",
    icy: "Icy/Hard",
    wet_spring: "Wet/Spring",
    variable: "Variable",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4 shadow-sm">
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
              {recommendation.category} • {recommendation.waistWidth} waist
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
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Current Conditions</p>
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${conditionBadgeColor[conditions.baseCondition]}`}>
                {conditionLabels[conditions.baseCondition]}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {conditions.avgTemperature}°C
              </span>
              {conditions.freshSnow24h > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  +{conditions.freshSnow24h}cm (24h)
                </span>
              )}
              {conditions.freshSnow48h > 0 && conditions.freshSnow24h === 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-sky-100 text-sky-700">
                  +{conditions.freshSnow48h}cm (48h)
                </span>
              )}
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {conditions.maxWind < 15 ? "Calm" : conditions.maxWind < 40 ? "Moderate wind" : "Strong wind"}
              </span>
              {conditions.foehnActive && (
                <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                  Foehn Active
                </span>
              )}
              {conditions.cornConditions && (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  Corn Snow
                </span>
              )}
            </div>
          </div>

          {/* User preferences */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Terrain</label>
              <select
                value={terrain}
                onChange={(e) => setTerrain(e.target.value as TerrainType)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
              >
                <option value="piste">Piste (groomed)</option>
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
                <option value="advanced">Advanced</option>
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
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 175)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                min={140}
                max={210}
              />
            </div>
          </div>

          {/* Main Recommendation */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{recommendation.category}</h4>
                <div className="flex gap-3 mt-1">
                  <span className="text-sm text-indigo-600 font-medium">{recommendation.waistWidth} waist</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-indigo-600 font-medium">{recommendation.length} length</span>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white ${confidenceColor[recommendation.confidence]}`}>
                {recommendation.confidence} confidence
              </span>
            </div>

            {/* Profile */}
            <div className="mb-3 text-sm">
              <span className="font-medium text-gray-700">Profile: </span>
              <span className="text-gray-600">{recommendation.profile}</span>
            </div>

            {/* Area recommendation */}
            <div className="mb-3 p-2 bg-white/60 rounded-lg">
              <span className="text-xs font-medium text-gray-500 uppercase">Best Area Today</span>
              <p className="text-sm text-gray-800 font-medium">{recommendation.areaRecommendation}</p>
            </div>

            {/* Timing advice */}
            {recommendation.timingAdvice && (
              <div className="mb-3 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                <span className="text-xs font-medium text-amber-700 uppercase">Timing</span>
                <p className="text-sm text-amber-800">{recommendation.timingAdvice}</p>
              </div>
            )}

            {/* Reasoning */}
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Why this ski?</p>
              <ul className="space-y-1">
                {recommendation.reasoning.slice(0, 4).map((reason, i) => (
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
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Tips for Today</p>
                <ul className="space-y-1">
                  {recommendation.tips.slice(0, 5).map((tip, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-amber-500">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Chamonix knowledge footer */}
          <p className="text-xs text-gray-400 text-center">
            Calibrated for Chamonix&apos;s maritime-transitional snow climate
          </p>
        </div>
      )}
    </div>
  );
}
