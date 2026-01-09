import { formatTimestamp } from "@/lib/utils";
import { Mountain, Clock } from "lucide-react";

interface HeaderProps {
  resort: string;
  lastUpdate: string | null;
}

export function Header({ resort, lastUpdate }: HeaderProps) {
  return (
    <header className="relative mb-4 -mx-4 -mt-4 px-4 pt-5 pb-8 overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900"
        aria-hidden="true"
      />

      {/* Mountain silhouette */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-12 text-gray-50"
        viewBox="0 0 400 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0 40 L0 30 L40 20 L80 28 L120 12 L160 22 L200 8 L240 20 L280 14 L320 25 L360 16 L400 26 L400 40 Z"
        />
      </svg>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mountain className="w-5 h-5 text-white/70" />
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
              Ski Status
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-white/60">
            <Clock className="w-3 h-3" />
            <span className="text-xs">
              {formatTimestamp(lastUpdate)}
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-2">
          {resort}
        </h1>
      </div>
    </header>
  );
}
