import { formatTimestamp } from "@/lib/utils";
import { Mountain, Clock } from "lucide-react";

interface HeaderProps {
  resort: string;
  lastUpdate: string | null;
}

export function Header({ resort, lastUpdate }: HeaderProps) {
  return (
    <header className="relative mb-4 -mx-4 -mt-4 px-4 pt-6 pb-4 overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900"
        aria-hidden="true"
      />

      {/* Mountain silhouette */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-16 text-gray-50 opacity-100"
        viewBox="0 0 400 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0 60 L0 45 L40 30 L80 42 L120 20 L160 35 L200 15 L240 32 L280 22 L320 38 L360 25 L400 40 L400 60 Z"
        />
      </svg>

      {/* Decorative peaks in background */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-24 text-white/5"
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0 80 L0 60 L50 35 L100 55 L150 25 L200 45 L250 20 L300 50 L350 30 L400 55 L400 80 Z"
        />
      </svg>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <Mountain className="w-5 h-5 text-white/70" />
          <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
            Ski Status
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {resort}
        </h1>
        <div className="flex items-center gap-1.5 mt-2 text-white/60">
          <Clock className="w-3.5 h-3.5" />
          <p className="text-xs">
            {formatTimestamp(lastUpdate)}
          </p>
        </div>
      </div>
    </header>
  );
}
