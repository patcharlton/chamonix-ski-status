import { CalculatedSummary, WeatherStation } from "@/types/ski-data";
import { PisteSummary } from "./PisteSummary";

interface StatsBarProps {
  summary: CalculatedSummary;
  weather: WeatherStation[];
}

export function StatsBar({ summary, weather }: StatsBarProps) {
  // Find temperature range across all stations
  const temps = weather
    .map((w) => w.temp_morning_c)
    .filter((t): t is number => t !== null);
  const minTemp = temps.length > 0 ? Math.min(...temps) : null;
  const maxTemp = temps.length > 0 ? Math.max(...temps) : null;

  // Find predominant snow quality
  const qualities = weather
    .map((w) => w.snow_quality)
    .filter((q): q is string => q !== null);
  const snowQuality = qualities.length > 0 ? qualities[0] : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        {/* Lifts */}
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.lifts_open}
            <span className="text-lg text-gray-400">/{summary.lifts_total}</span>
          </p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Lifts Open</p>
        </div>

        {/* Temperature */}
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {minTemp !== null ? `${minTemp}°` : "—"}
            {maxTemp !== null && maxTemp !== minTemp && (
              <span className="text-lg text-gray-400"> to {maxTemp}°</span>
            )}
          </p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Temperature</p>
        </div>

        {/* Snow */}
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {snowQuality === "FRAICHE" && "❄️"}
            {snowQuality === "DOUCE" && "☁️"}
            {snowQuality === "HUMIDE" && "💧"}
            {!snowQuality && "—"}
          </p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {snowQuality === "FRAICHE" && "Fresh Snow"}
            {snowQuality === "DOUCE" && "Soft Snow"}
            {snowQuality === "HUMIDE" && "Wet Snow"}
            {!snowQuality && "Snow"}
          </p>
        </div>
      </div>

      {/* Piste summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <PisteSummary pistes={summary.pistes_by_difficulty} />
      </div>
    </div>
  );
}
