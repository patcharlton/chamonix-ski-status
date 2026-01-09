import { Lift, Piste } from "@/types/ski-data";
import { SectorCard } from "./SectorCard";

interface SectorListProps {
  lifts: Record<string, Lift[]>;
  pistes: Record<string, Piste[]>;
}

export function SectorList({ lifts, pistes }: SectorListProps) {
  // Get all unique sectors and sort by number of lifts (most first)
  const sectors = Object.keys(lifts).sort((a, b) => {
    return (lifts[b]?.length ?? 0) - (lifts[a]?.length ?? 0);
  });

  return (
    <div className="space-y-3">
      {sectors.map((sector) => (
        <SectorCard
          key={sector}
          name={sector}
          lifts={lifts[sector] ?? []}
          pistes={pistes[sector] ?? []}
        />
      ))}
    </div>
  );
}
