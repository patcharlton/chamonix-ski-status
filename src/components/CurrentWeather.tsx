import { WeatherStation } from "@/types/ski-data";
import { formatTemp, getWindArrow, getSnowQualityLabel } from "@/lib/utils";

interface CurrentWeatherProps {
  station: WeatherStation;
  className?: string;
}

export function CurrentWeather({ station, className = "" }: CurrentWeatherProps) {
  const temp = station.temp_morning_c ?? station.temp_afternoon_c;
  const isCold = temp !== null && temp < -5;
  const isSnowing = station.snow_quality === "FRAICHE" && (station.last_snowfall_cm ?? 0) > 20;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 ${className}`}
      style={{
        background: isCold
          ? "linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #3b7cb8 100%)"
          : "linear-gradient(135deg, #4a90c2 0%, #68a8d8 50%, #87c0eb 100%)",
      }}
    >
      {/* Snowflake decorations */}
      {isSnowing && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <span className="absolute text-4xl opacity-20 top-2 right-4 animate-pulse">❄️</span>
          <span className="absolute text-2xl opacity-15 top-12 right-16">❄️</span>
          <span className="absolute text-3xl opacity-10 bottom-4 right-8">❄️</span>
        </div>
      )}

      {/* Mountain silhouette decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10">
        <svg viewBox="0 0 400 60" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M0,60 L0,40 L50,25 L100,45 L150,20 L200,35 L250,15 L300,30 L350,10 L400,25 L400,60 Z"
            fill="white"
          />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Location */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-white font-bold text-lg">{station.location_name}</h2>
            <p className="text-white/70 text-sm">{station.elevation_m}m altitude</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs uppercase tracking-wide">Now</p>
          </div>
        </div>

        {/* Main temperature */}
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <span className="text-6xl font-light text-white tracking-tight">
              {temp !== null ? temp : "—"}
            </span>
            <span className="text-3xl text-white/80 mt-1">°C</span>
          </div>

          {/* Weather icon */}
          <div className="text-5xl">
            {isSnowing ? "🌨️" : isCold ? "❄️" : "⛅"}
          </div>
        </div>

        {/* Details row */}
        <div className="flex items-center gap-4 mt-4 text-white/90">
          {/* Wind */}
          {station.wind_speed_kmh !== null && (
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{getWindArrow(station.wind_direction)}</span>
              <span className="text-sm font-medium">{station.wind_speed_kmh} km/h</span>
            </div>
          )}

          {/* Divider */}
          {station.wind_speed_kmh !== null && station.snow_depth_cm !== null && (
            <div className="w-px h-4 bg-white/30" />
          )}

          {/* Snow depth */}
          {station.snow_depth_cm !== null && (
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🏔️</span>
              <span className="text-sm font-medium">{station.snow_depth_cm}cm base</span>
            </div>
          )}

          {/* Divider */}
          {station.snow_quality && (
            <div className="w-px h-4 bg-white/30" />
          )}

          {/* Snow quality */}
          {station.snow_quality && (
            <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
              {getSnowQualityLabel(station.snow_quality)}
            </span>
          )}
        </div>

        {/* New snow callout */}
        {station.last_snowfall_cm && station.last_snowfall_cm > 10 && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span>🎿</span>
            <span className="text-sm font-medium text-white">
              +{station.last_snowfall_cm}cm fresh snow!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
