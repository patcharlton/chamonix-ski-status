"use client";

import { useState, useMemo } from "react";
import { WeatherStation } from "@/types/ski-data";
import {
  Eye,
  EyeOff,
  Glasses,
  Thermometer,
  ThermometerSnowflake,
  Sun,
  CloudSun,
  Wind,
  Snowflake,
  Sparkles,
  Droplets,
  AlertTriangle,
  Mountain,
  Gauge,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { ReactElement } from "react";

interface ConditionsSummaryProps {
  weather: WeatherStation[];
}

interface ConditionInsight {
  icon: ReactElement;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

function generateInsights(weather: WeatherStation[]): ConditionInsight[] {
  const insights: ConditionInsight[] = [];

  // Aggregate data
  const temps = weather.map(w => w.temp_morning_c ?? 0);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  const minTemp = Math.min(...temps);
  const maxWind = Math.max(...weather.map(w => w.wind_speed_kmh ?? 0));
  const avgWind = weather.reduce((sum, w) => sum + (w.wind_speed_kmh ?? 0), 0) / weather.length;
  const snowQualities = weather.map(w => w.snow_quality).filter(Boolean);
  const avalancheRisk = Math.max(...weather.map(w => w.avalanche_risk ?? 0));
  const freshSnow = Math.max(...weather.map(w => w.last_snowfall_cm ?? 0));
  const snowDepths = weather.map(w => w.snow_depth_cm ?? 0);
  const avgSnowDepth = snowDepths.reduce((a, b) => a + b, 0) / snowDepths.length;

  // Check for recent snowfall date
  const midStation = weather.sort((a, b) => b.elevation_m - a.elevation_m)[Math.floor(weather.length / 2)];
  const lastSnowDate = midStation?.last_snowfall_date;
  const today = new Date().toLocaleDateString('fr-FR');
  const isRecentSnow = lastSnowDate === today;

  // Wind direction for Foehn detection
  const windDir = midStation?.wind_direction?.toUpperCase() ?? "";
  const isFoehn = (windDir.includes("SUD") || windDir === "S") && avgTemp > 0;

  // === VISIBILITY CONDITIONS ===
  if (maxWind > 50) {
    insights.push({
      icon: <EyeOff className="w-5 h-5 text-amber-600" />,
      title: "Whiteout Risk",
      description: "Strong winds creating poor visibility at altitude. Yellow or orange lens goggles essential. Stick to tree-lined runs at Les Houches if possible.",
      priority: "high",
    });
  } else if (maxWind > 35 || isRecentSnow) {
    insights.push({
      icon: <Glasses className="w-5 h-5 text-blue-500" />,
      title: "Flat Light Expected",
      description: "Reduced contrast on the slopes today. Bring yellow, orange or pink lens goggles to help see terrain features. Avoid steep unfamiliar runs.",
      priority: "medium",
    });
  } else {
    insights.push({
      icon: <Eye className="w-5 h-5 text-green-500" />,
      title: "Good Visibility",
      description: "Clear conditions expected. Dark or mirror lens goggles recommended for bright snow glare.",
      priority: "low",
    });
  }

  // === TEMPERATURE CONDITIONS ===
  if (minTemp < -15) {
    insights.push({
      icon: <ThermometerSnowflake className="w-5 h-5 text-blue-600" />,
      title: "Extreme Cold",
      description: `Summit temps down to ${minTemp}°C. Add an extra base layer, cover all exposed skin, and take regular warming breaks. Risk of frostbite on chairlifts.`,
      priority: "high",
    });
  } else if (minTemp < -10) {
    insights.push({
      icon: <Snowflake className="w-5 h-5 text-cyan-500" />,
      title: "Very Cold",
      description: `Temperatures around ${Math.round(avgTemp)}°C. Wear a good base layer, bring hand warmers, and cover your face on chairlifts. The cold keeps snow in great condition.`,
      priority: "medium",
    });
  } else if (avgTemp > 5) {
    insights.push({
      icon: <Sun className="w-5 h-5 text-yellow-500" />,
      title: "Warm & Sunny",
      description: `Mild temperatures around ${Math.round(avgTemp)}°C. Snow will soften quickly after 11am. Ski early for best conditions, apply sunscreen and stay hydrated.`,
      priority: "medium",
    });
  } else if (avgTemp > 0) {
    insights.push({
      icon: <CloudSun className="w-5 h-5 text-amber-400" />,
      title: "Spring-like Conditions",
      description: `Temperatures hovering around freezing. Dress in layers you can remove. Morning snow will be firm, softening through the day.`,
      priority: "low",
    });
  }

  // === WIND CONDITIONS ===
  if (maxWind > 60) {
    insights.push({
      icon: <Wind className="w-5 h-5 text-red-500" />,
      title: "Severe Wind",
      description: `Gusts up to ${maxWind}km/h at altitude. Expect lift closures at exposed areas. Wind chill will be brutal—cover all skin and brace on chairlifts.`,
      priority: "high",
    });
  } else if (maxWind > 40) {
    insights.push({
      icon: <Wind className="w-5 h-5 text-amber-500" />,
      title: "Strong Winds",
      description: `Wind speeds reaching ${maxWind}km/h. Some exposed lifts may close. Stay low if upper lifts are running but miserable. Watch for wind-loaded slopes off-piste.`,
      priority: "medium",
    });
  } else if (avgWind > 25) {
    insights.push({
      icon: <Wind className="w-5 h-5 text-gray-400" />,
      title: "Breezy",
      description: "Moderate winds creating some drift. Good skiing but bring a buff for chairlifts. Off-piste skiers should check for wind slab on lee slopes.",
      priority: "low",
    });
  }

  // === SNOW CONDITIONS ===
  if (snowQualities.includes("FRAICHE") && freshSnow > 20 && isRecentSnow) {
    insights.push({
      icon: <Sparkles className="w-5 h-5 text-blue-500" />,
      title: "Fresh Powder!",
      description: `${freshSnow}cm of fresh snow! Get there early for untracked runs. Powder in Chamonix settles fast—today and tomorrow are prime. Grands Montets for best off-piste access.`,
      priority: "high",
    });
  } else if (snowQualities.includes("FRAICHE") && freshSnow > 10) {
    insights.push({
      icon: <Snowflake className="w-5 h-5 text-blue-400" />,
      title: "Good Fresh Snow",
      description: `${freshSnow}cm of recent snowfall improving conditions. Some fresh lines still available on north-facing slopes above 2500m. Pistes will be in excellent shape.`,
      priority: "medium",
    });
  } else if (snowQualities.includes("HUMIDE")) {
    insights.push({
      icon: <Droplets className="w-5 h-5 text-blue-400" />,
      title: "Heavy Wet Snow",
      description: "Humid snow conditions making for sticky, energy-sapping skiing. Wax your skis for wet snow. Best skiing before 11am when temperatures rise.",
      priority: "medium",
    });
  } else if (snowQualities.includes("CROUTE")) {
    insights.push({
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      title: "Crusty Conditions",
      description: "Breakable crust has formed on off-piste snow. Stick to groomed runs unless you enjoy a challenge. Crust can be ankle-breaking if you break through.",
      priority: "medium",
    });
  } else if (snowQualities.includes("TRANSFORMÉE")) {
    insights.push({
      icon: <RefreshCw className="w-5 h-5 text-gray-500" />,
      title: "Transformed Snow",
      description: "Snow has gone through melt-freeze cycles. Morning will be firm/icy, softening by midday. Classic spring skiing—time your runs by aspect and elevation.",
      priority: "low",
    });
  }

  // === AVALANCHE CONDITIONS ===
  if (avalancheRisk >= 4) {
    insights.push({
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      title: "High Avalanche Danger",
      description: `Avalanche risk at ${avalancheRisk}/5. Stay on marked pistes only. Natural and human-triggered avalanches likely. Off-piste skiing strongly discouraged today.`,
      priority: "high",
    });
  } else if (avalancheRisk === 3) {
    insights.push({
      icon: <Mountain className="w-5 h-5 text-amber-500" />,
      title: "Considerable Avalanche Risk",
      description: `Avalanche risk at 3/5. Off-piste requires experience, proper equipment (transceiver, probe, shovel), and ideally a guide. Avoid steep slopes >30°.`,
      priority: "medium",
    });
  }

  // === FOEHN CONDITIONS ===
  if (isFoehn) {
    insights.push({
      icon: <Thermometer className="w-5 h-5 text-red-400" />,
      title: "Foehn Wind Active",
      description: "Warm southerly Foehn wind is blowing. Temperatures rising unusually, snow conditions deteriorating rapidly. Increased avalanche risk on south-facing slopes.",
      priority: "high",
    });
  }

  // === SNOW BASE ===
  if (avgSnowDepth > 150) {
    insights.push({
      icon: <Gauge className="w-5 h-5 text-green-500" />,
      title: "Excellent Snow Base",
      description: `Strong base of ${Math.round(avgSnowDepth)}cm across the resort. Full terrain coverage and good conditions even on south-facing slopes.`,
      priority: "low",
    });
  } else if (avgSnowDepth < 50) {
    insights.push({
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      title: "Thin Snow Cover",
      description: `Limited base of ${Math.round(avgSnowDepth)}cm. Watch for rocks and obstacles. Stick to well-covered north-facing runs.`,
      priority: "medium",
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return insights.slice(0, 4); // Max 4 insights
}

function getOverallCondition(weather: WeatherStation[]): { icon: ReactElement; label: string; color: string } {
  const avgTemp = weather.reduce((sum, w) => sum + (w.temp_morning_c ?? 0), 0) / weather.length;
  const maxWind = Math.max(...weather.map(w => w.wind_speed_kmh ?? 0));
  const avalancheRisk = Math.max(...weather.map(w => w.avalanche_risk ?? 0));
  const snowQuality = weather.find(w => w.snow_quality)?.snow_quality;
  const freshSnow = Math.max(...weather.map(w => w.last_snowfall_cm ?? 0));

  // Determine overall vibe
  if (maxWind > 50 || avalancheRisk >= 4) {
    return { icon: <AlertTriangle className="w-5 h-5 text-amber-600" />, label: "Challenging", color: "bg-amber-100 text-amber-800" };
  }
  if (snowQuality === "FRAICHE" && freshSnow > 20) {
    return { icon: <Sparkles className="w-5 h-5 text-blue-500" />, label: "Powder Day", color: "bg-blue-100 text-blue-800" };
  }
  if (avgTemp > 5) {
    return { icon: <Sun className="w-5 h-5 text-yellow-500" />, label: "Spring Skiing", color: "bg-yellow-100 text-yellow-800" };
  }
  if (avgTemp < -10) {
    return { icon: <Snowflake className="w-5 h-5 text-cyan-500" />, label: "Cold & Crisp", color: "bg-cyan-100 text-cyan-800" };
  }
  if (maxWind > 35) {
    return { icon: <Wind className="w-5 h-5 text-gray-500" />, label: "Windy", color: "bg-gray-100 text-gray-800" };
  }
  return { icon: <Sun className="w-5 h-5 text-green-500" />, label: "Great Conditions", color: "bg-green-100 text-green-800" };
}

export function ConditionsSummary({ weather }: ConditionsSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const insights = useMemo(() => generateInsights(weather), [weather]);
  const overall = useMemo(() => getOverallCondition(weather), [weather]);

  const priorityStyles = {
    high: "border-l-amber-500 bg-amber-50",
    medium: "border-l-blue-400 bg-blue-50",
    low: "border-l-gray-300 bg-gray-50",
  };

  const topInsight = insights[0];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-3">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {overall.icon}
          <div className="text-left">
            <h3 className="font-medium text-gray-900 text-sm">Conditions Today</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              {topInsight && (
                <>
                  <span className="shrink-0">{topInsight.title}</span>
                  {insights.length > 1 && <span className="text-gray-400">+{insights.length - 1} more</span>}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${overall.color}`}>
            {overall.label}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Expanded Insights */}
      {isExpanded && (
        <div className="p-3 pt-0 space-y-2 border-t border-gray-100">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`border-l-4 rounded-r-lg p-2.5 ${priorityStyles[insight.priority]}`}
            >
              <div className="flex items-start gap-2">
                <span className="shrink-0">{insight.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
