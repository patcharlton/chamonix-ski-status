import { WeatherStation } from "@/types/ski-data";
import { WeatherCard } from "./WeatherCard";

interface WeatherCarouselProps {
  stations: WeatherStation[];
}

export function WeatherCarousel({ stations }: WeatherCarouselProps) {
  // Filter to main ski areas (exclude town-level stations)
  const skiStations = stations.filter((s) => s.elevation_m >= 1800);

  return (
    <div className="relative">
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {skiStations.map((station, idx) => (
          <WeatherCard key={idx} station={station} />
        ))}
      </div>
      {/* Fade indicators */}
      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
    </div>
  );
}
