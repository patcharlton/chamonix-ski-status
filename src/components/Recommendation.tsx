"use client";

import { useState } from "react";
import { WeatherStation, Lift, Piste } from "@/types/ski-data";
import { MapPin, ChevronDown, Sparkles, Wind, Star, ThumbsUp, AlertTriangle } from "lucide-react";

interface RecommendationProps {
  weather: WeatherStation[];
  lifts: Record<string, Lift[]>;
  pistes: Record<string, Piste[]>;
}

// Map sector names to weather station names
const sectorToWeatherMap: Record<string, string> = {
  "AIGUILLE DU MIDI": "Aiguille du Midi",
  "BREVENT": "Brévent",
  "DOMAINE DE BALME": "Balme Tour-Vallorcine",
  "FLEGERE": "Flégère",
  "GRANDS MONTETS": "Grands Montets",
  "LES HOUCHES": "Les Houches",
  "SITE DU MONTENVERS": "Montenvers",
  "TRAMWAY MONT BLANC": "Tramway du Mont-Blanc",
};

const sectorDisplayNames: Record<string, string> = {
  "AIGUILLE DU MIDI": "Aiguille du Midi",
  "BREVENT": "Brévent",
  "DOMAINE DE BALME": "Domaine de Balme",
  "FLEGERE": "Flégère",
  "GRANDS MONTETS": "Grands Montets",
  "LA VORMAINE": "La Vormaine",
  "LES HOUCHES": "Les Houches",
  "LES CHOSALETS": "Les Chosalets",
  "PLANARDS": "Planards",
  "POYA": "Poya",
  "SITE DU MONTENVERS": "Montenvers",
  "TRAMWAY MONT BLANC": "Tramway du Mont-Blanc",
};

interface DomainScore {
  sector: string;
  name: string;
  score: number;
  liftsOpen: number;
  liftsTotal: number;
  weather: WeatherStation | null;
  reasons: string[];
}

function scoreDomain(
  sector: string,
  sectorLifts: Lift[],
  sectorPistes: Piste[],
  weather: WeatherStation | null
): DomainScore {
  let score = 0;
  const reasons: string[] = [];

  const liftsOpen = sectorLifts.filter((l) => l.status === "O").length;
  const liftsTotal = sectorLifts.length;
  const liftRatio = liftsTotal > 0 ? liftsOpen / liftsTotal : 0;

  // Lift availability (0-40 points)
  score += liftsOpen * 4;
  if (liftRatio >= 0.75) {
    score += 15;
    reasons.push("most lifts running");
  } else if (liftRatio >= 0.5) {
    score += 8;
  }

  // Piste variety (0-20 points)
  const pistesOpen = sectorPistes.filter((p) => p.status === "O").length;
  const difficulties = new Set(
    sectorPistes.filter((p) => p.status === "O").map((p) => p.difficulty)
  );
  score += pistesOpen * 2;
  if (difficulties.size >= 3) {
    score += 10;
    reasons.push("great variety of runs");
  }

  // Weather conditions (0-30 points)
  if (weather) {
    // Wind (lower is better, max 15 points)
    const wind = weather.wind_speed_kmh ?? 0;
    if (wind < 20) {
      score += 15;
      reasons.push("calm winds");
    } else if (wind < 40) {
      score += 10;
    } else if (wind < 60) {
      score += 5;
    } else {
      score -= 10;
    }

    // Fresh snow bonus (0-15 points)
    if (weather.snow_quality === "FRAICHE") {
      score += 10;
      if (weather.last_snowfall_cm && weather.last_snowfall_cm > 20) {
        score += 5;
        reasons.push(`${weather.last_snowfall_cm}cm fresh snow`);
      } else {
        reasons.push("fresh snow");
      }
    } else if (weather.snow_quality === "DOUCE") {
      score += 5;
      reasons.push("soft snow");
    }

    // Snow depth bonus
    if (weather.snow_depth_cm && weather.snow_depth_cm > 100) {
      score += 5;
    }

    // Temperature consideration (not too cold)
    const temp = weather.temp_morning_c ?? 0;
    if (temp >= -10 && temp <= -2) {
      score += 5;
    }
  }

  // Minimum viable area (needs at least 2 lifts open)
  if (liftsOpen < 2) {
    score = Math.max(0, score - 50);
  }

  return {
    sector,
    name: sectorDisplayNames[sector] || sector,
    score,
    liftsOpen,
    liftsTotal,
    weather,
    reasons,
  };
}

export function Recommendation({ weather, lifts, pistes }: RecommendationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Find weather for each sector
  const findWeather = (sector: string): WeatherStation | null => {
    const weatherName = sectorToWeatherMap[sector];
    if (!weatherName) return null;
    return (
      weather.find((w) =>
        w.location_name.toLowerCase().includes(weatherName.toLowerCase())
      ) || null
    );
  };

  // Score all domains
  const scores: DomainScore[] = Object.keys(lifts)
    .map((sector) =>
      scoreDomain(
        sector,
        lifts[sector] || [],
        pistes[sector] || [],
        findWeather(sector)
      )
    )
    .filter((s) => s.liftsOpen > 0)
    .sort((a, b) => b.score - a.score);

  if (scores.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-3">
        <div className="p-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="font-medium text-gray-900 text-sm">Limited skiing today</h3>
            <p className="text-xs text-gray-500">Most areas appear to be closed</p>
          </div>
        </div>
      </div>
    );
  }

  const top = scores[0];
  const avalancheRisk = Math.max(...weather.map((w) => w.avalanche_risk ?? 0));

  // Pick icon based on conditions
  const ConditionIcon = top.weather?.snow_quality === "FRAICHE"
    ? Sparkles
    : top.weather?.wind_speed_kmh && top.weather.wind_speed_kmh > 40
    ? Wind
    : top.score > 60
    ? Star
    : ThumbsUp;

  const iconColor = top.weather?.snow_quality === "FRAICHE"
    ? "text-blue-500"
    : top.weather?.wind_speed_kmh && top.weather.wind_speed_kmh > 40
    ? "text-gray-500"
    : top.score > 60
    ? "text-amber-500"
    : "text-green-500";

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-indigo-500" />
          <div className="text-left">
            <h3 className="font-medium text-gray-900 text-sm">Today&apos;s Pick</h3>
            <p className="text-xs text-gray-500">
              {top.name} • {top.liftsOpen}/{top.liftsTotal} lifts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ConditionIcon className={`w-4 h-4 ${iconColor}`} />
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-2">
          <div className="space-y-2">
            {/* Why this pick */}
            {top.reasons.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {top.reasons.map((reason, i) => (
                  <span
                    key={i}
                    className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            )}

            {/* Weather info */}
            {top.weather && (
              <p className="text-xs text-gray-600">
                {top.weather.temp_morning_c !== null && `${top.weather.temp_morning_c}°C`}
                {top.weather.wind_speed_kmh !== null && ` • Wind ${top.weather.wind_speed_kmh}km/h`}
                {top.weather.snow_depth_cm !== null && ` • ${top.weather.snow_depth_cm}cm base`}
              </p>
            )}

            {/* Avalanche warning */}
            {avalancheRisk >= 3 && (
              <p className="text-xs text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {avalancheRisk >= 4 ? "Stay on marked pistes - high avalanche risk" : "Exercise caution off-piste"}
              </p>
            )}

            {/* Alternatives */}
            {scores.length > 1 && (
              <p className="text-xs text-gray-500">
                Also good: {scores.slice(1, 3).map((s) => s.name).join(", ")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
