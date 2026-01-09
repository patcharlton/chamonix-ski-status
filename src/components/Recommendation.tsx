import { WeatherStation, Lift, Piste } from "@/types/ski-data";

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
      score -= 10; // Penalty for high wind
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
      score += 5; // Ideal skiing temperature
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

function generateRecommendation(top: DomainScore, avalancheRisk: number): string {
  const parts: string[] = [];

  // Opening line
  if (top.score > 60) {
    parts.push(`Head to **${top.name}** today`);
  } else if (top.score > 40) {
    parts.push(`**${top.name}** is your best bet today`);
  } else {
    parts.push(`Consider **${top.name}** for the best conditions`);
  }

  // Stats
  parts.push(`with ${top.liftsOpen}/${top.liftsTotal} lifts open`);

  // Reasons
  if (top.reasons.length > 0) {
    if (top.reasons.length === 1) {
      parts.push(`and ${top.reasons[0]}`);
    } else {
      const lastReason = top.reasons.pop();
      parts.push(`featuring ${top.reasons.join(", ")} and ${lastReason}`);
    }
  }

  // Weather detail
  if (top.weather) {
    const temp = top.weather.temp_morning_c;
    if (temp !== null) {
      parts.push(`at ${temp}°C`);
    }
  }

  // Avalanche warning
  if (avalancheRisk >= 4) {
    parts.push("— stay on marked pistes due to high avalanche risk");
  } else if (avalancheRisk === 3) {
    parts.push("— exercise caution off-piste");
  }

  return parts.join(" ") + ".";
}

export function Recommendation({ weather, lifts, pistes }: RecommendationProps) {
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
    .filter((s) => s.liftsOpen > 0) // Only consider areas with something open
    .sort((a, b) => b.score - a.score);

  if (scores.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-medium text-amber-800">Limited skiing today</p>
            <p className="text-sm text-amber-700 mt-1">
              Most areas appear to be closed. Check back later for updates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const top = scores[0];
  const avalancheRisk = Math.max(...weather.map((w) => w.avalanche_risk ?? 0));
  const recommendation = generateRecommendation({ ...top }, avalancheRisk);

  // Pick an appropriate emoji based on conditions
  const emoji =
    top.weather?.snow_quality === "FRAICHE"
      ? "🎿"
      : top.weather?.wind_speed_kmh && top.weather.wind_speed_kmh > 40
      ? "💨"
      : top.score > 60
      ? "⭐"
      : "👍";

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{emoji}</span>
        <div>
          <p className="font-medium text-gray-900">Today&apos;s Pick</p>
          <p
            className="text-sm text-gray-700 mt-1"
            dangerouslySetInnerHTML={{
              __html: recommendation.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
            }}
          />
          {scores.length > 1 && (
            <p className="text-xs text-gray-500 mt-2">
              Also good: {scores.slice(1, 3).map((s) => s.name).join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
