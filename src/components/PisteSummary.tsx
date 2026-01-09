import { PistesByDifficulty } from "@/types/ski-data";
import { PisteDifficultyIcon } from "./Icons";

interface PisteSummaryProps {
  pistes: PistesByDifficulty;
  compact?: boolean;
}

export function PisteSummary({ pistes, compact = false }: PisteSummaryProps) {
  const difficulties = [
    { key: "green" as const, code: "V" as const, label: "Green" },
    { key: "blue" as const, code: "B" as const, label: "Blue" },
    { key: "red" as const, code: "R" as const, label: "Red" },
    { key: "black" as const, code: "N" as const, label: "Black" },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {difficulties.map(({ key, code }) => {
          const { open, total } = pistes[key];
          if (total === 0) return null;
          return (
            <div key={key} className="flex items-center gap-1">
              <span className={open === 0 ? "opacity-30" : ""}>
                <PisteDifficultyIcon difficulty={code} size={12} />
              </span>
              <span className="text-xs text-gray-600">
                {open}/{total}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {difficulties.map(({ key, code, label }) => {
        const { open, total } = pistes[key];
        if (total === 0) return null;
        return (
          <div key={key} className="flex items-center gap-1.5">
            <PisteDifficultyIcon difficulty={code} size={16} />
            <span className="text-sm text-gray-700">
              {label}: {open}/{total}
            </span>
          </div>
        );
      })}
    </div>
  );
}
