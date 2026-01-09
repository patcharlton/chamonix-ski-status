import { WeatherStation } from "@/types/ski-data";
import { formatTemp, getWindArrow, getSnowQualityLabel } from "@/lib/utils";

interface WeatherCardProps {
  station: WeatherStation;
}

export function WeatherCard({ station }: WeatherCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 min-w-[160px] shrink-0">
      <div className="mb-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
          {station.location_name}
        </h3>
        <p className="text-xs text-gray-500">{station.elevation_m}m</p>
      </div>

      <div className="space-y-2">
        {/* Temperature */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            {formatTemp(station.temp_morning_c)}
          </span>
          {station.temp_afternoon_c !== null && (
            <span className="text-sm text-gray-500">
              → {formatTemp(station.temp_afternoon_c)}
            </span>
          )}
        </div>

        {/* Wind */}
        {station.wind_speed_kmh !== null && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span className="text-base">{getWindArrow(station.wind_direction)}</span>
            <span>{station.wind_speed_kmh} km/h</span>
          </div>
        )}

        {/* Snow */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <span>❄️</span>
            <span className="font-medium">{station.snow_depth_cm ?? "—"}cm</span>
          </div>
          {station.snow_quality && (
            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
              {getSnowQualityLabel(station.snow_quality)}
            </span>
          )}
        </div>

        {/* Recent snowfall */}
        {station.last_snowfall_cm && (
          <p className="text-xs text-gray-500">
            +{station.last_snowfall_cm}cm new
          </p>
        )}
      </div>
    </div>
  );
}
