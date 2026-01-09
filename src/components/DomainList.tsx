import { WeatherStation, Lift, Piste } from "@/types/ski-data";
import { DomainCard } from "./DomainCard";

interface DomainListProps {
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

// Display names for sectors
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

export function DomainList({ weather, lifts, pistes }: DomainListProps) {
  // Get all sectors and sort by most lifts open first
  const sectors = Object.keys(lifts).sort((a, b) => {
    const aLifts = lifts[a] || [];
    const bLifts = lifts[b] || [];
    const aOpen = aLifts.filter((l) => l.status === "O").length;
    const bOpen = bLifts.filter((l) => l.status === "O").length;

    // Primary sort: most open lifts first
    if (bOpen !== aOpen) return bOpen - aOpen;

    // Secondary sort: most total lifts (larger areas) first
    return bLifts.length - aLifts.length;
  });

  // Find weather station for a sector
  const findWeather = (sector: string): WeatherStation | null => {
    const weatherName = sectorToWeatherMap[sector];
    if (!weatherName) return null;
    return weather.find((w) =>
      w.location_name.toLowerCase().includes(weatherName.toLowerCase())
    ) || null;
  };

  return (
    <div className="space-y-3">
      {sectors.map((sector) => (
        <DomainCard
          key={sector}
          name={sectorDisplayNames[sector] || sector}
          weather={findWeather(sector)}
          lifts={lifts[sector] || []}
          pistes={pistes[sector] || []}
        />
      ))}
    </div>
  );
}
