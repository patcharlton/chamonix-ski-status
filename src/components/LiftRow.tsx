import { Lift } from "@/types/ski-data";
import { getLiftStatusIcon, cn } from "@/lib/utils";

interface LiftRowProps {
  lift: Lift;
}

export function LiftRow({ lift }: LiftRowProps) {
  const { icon, colour } = getLiftStatusIcon(lift.status);

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn("text-lg font-medium w-6 text-center", colour)}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {lift.lift_name}
          </p>
          {lift.status_message && (
            <p className="text-xs text-gray-500 truncate">{lift.status_message}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0 ml-2">
        <span className="bg-gray-100 px-1.5 py-0.5 rounded">{lift.lift_type}</span>
        <span>
          {lift.opening_time}–{lift.closing_time}
        </span>
      </div>
    </div>
  );
}
