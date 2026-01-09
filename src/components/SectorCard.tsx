"use client";

import { useState } from "react";
import { Lift, Piste } from "@/types/ski-data";
import { getStatusColour, getStatusBgClass, cn } from "@/lib/utils";
import { LiftRow } from "./LiftRow";

interface SectorCardProps {
  name: string;
  lifts: Lift[];
  pistes: Piste[];
}

export function SectorCard({ name, lifts, pistes }: SectorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const openLifts = lifts.filter((l) => l.status === "O").length;
  const totalLifts = lifts.length;
  const status = getStatusColour(openLifts, totalLifts);

  // Count pistes by difficulty
  const pisteStats = pistes.reduce(
    (acc, p) => {
      if (p.difficulty === "V") {
        acc.green.total++;
        if (p.status === "O") acc.green.open++;
      } else if (p.difficulty === "B") {
        acc.blue.total++;
        if (p.status === "O") acc.blue.open++;
      } else if (p.difficulty === "R") {
        acc.red.total++;
        if (p.status === "O") acc.red.open++;
      } else if (p.difficulty === "N") {
        acc.black.total++;
        if (p.status === "O") acc.black.open++;
      }
      return acc;
    },
    {
      green: { open: 0, total: 0 },
      blue: { open: 0, total: 0 },
      red: { open: 0, total: 0 },
      black: { open: 0, total: 0 },
    }
  );

  const hasPistes = Object.values(pisteStats).some((s) => s.total > 0);

  // Format sector name for display
  const displayName = name
    .split(" ")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={cn("w-3 h-3 rounded-full", getStatusBgClass(status))} />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{displayName}</h3>
            {hasPistes && (
              <div className="flex items-center gap-2 mt-0.5">
                {pisteStats.green.total > 0 && (
                  <span className="flex items-center gap-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-500">
                      {pisteStats.green.open}/{pisteStats.green.total}
                    </span>
                  </span>
                )}
                {pisteStats.blue.total > 0 && (
                  <span className="flex items-center gap-0.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs text-gray-500">
                      {pisteStats.blue.open}/{pisteStats.blue.total}
                    </span>
                  </span>
                )}
                {pisteStats.red.total > 0 && (
                  <span className="flex items-center gap-0.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs text-gray-500">
                      {pisteStats.red.open}/{pisteStats.red.total}
                    </span>
                  </span>
                )}
                {pisteStats.black.total > 0 && (
                  <span className="flex items-center gap-0.5">
                    <span className="w-2 h-2 rounded-full bg-gray-900" />
                    <span className="text-xs text-gray-500">
                      {pisteStats.black.open}/{pisteStats.black.total}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">
            {openLifts}/{totalLifts} lifts
          </span>
          <span
            className={cn(
              "text-gray-400 transition-transform",
              isExpanded && "rotate-180"
            )}
          >
            ▼
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="pt-2">
            {lifts.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No lift data available</p>
            ) : (
              lifts.map((lift, idx) => <LiftRow key={idx} lift={lift} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
