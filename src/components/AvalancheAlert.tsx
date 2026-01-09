import { cn } from "@/lib/utils";

interface AvalancheAlertProps {
  risk: number | null;
}

const riskConfig = {
  1: {
    label: "Low",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    icon: "bg-green-500",
    description: "Generally safe conditions",
  },
  2: {
    label: "Moderate",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    icon: "bg-yellow-500",
    description: "Heightened conditions on some slopes",
  },
  3: {
    label: "Considerable",
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-700",
    icon: "bg-orange-500",
    description: "Dangerous conditions on steep slopes",
  },
  4: {
    label: "High",
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-700",
    icon: "bg-red-600",
    description: "Very dangerous off-piste conditions",
  },
  5: {
    label: "Very High",
    bg: "bg-red-100",
    border: "border-red-400",
    text: "text-red-800",
    icon: "bg-red-700",
    description: "Extreme danger - avoid off-piste",
  },
};

export function AvalancheAlert({ risk }: AvalancheAlertProps) {
  if (risk === null || risk < 1 || risk > 5) return null;

  const config = riskConfig[risk as keyof typeof riskConfig];
  const isHighRisk = risk >= 4;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 mb-4 transition-all",
        config.bg,
        config.border,
        isHighRisk && "ring-2 ring-red-300 ring-offset-1"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Risk level indicator */}
        <div className="flex flex-col items-center">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm",
              config.icon
            )}
          >
            {risk}
          </div>
          <span className="text-[10px] text-gray-500 mt-0.5">/5</span>
        </div>

        {/* Risk bars visualization */}
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                "w-1.5 rounded-full transition-all",
                level <= risk ? config.icon : "bg-gray-200",
                level === 1 && "h-3",
                level === 2 && "h-4",
                level === 3 && "h-5",
                level === 4 && "h-6",
                level === 5 && "h-7"
              )}
            />
          ))}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("font-semibold text-sm", config.text)}>
              {config.label} Avalanche Risk
            </span>
            {isHighRisk && (
              <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded font-medium animate-pulse">
                CAUTION
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-0.5">{config.description}</p>
        </div>

        {/* Mountain warning icon for high risk */}
        {isHighRisk && (
          <div className="text-2xl shrink-0">⚠️</div>
        )}
      </div>
    </div>
  );
}
