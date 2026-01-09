import { LiftStatus, PisteDifficulty } from "@/types/ski-data";

export function getStatusColour(open: number, total: number): "green" | "amber" | "red" {
  if (total === 0) return "red";
  const ratio = open / total;
  if (ratio >= 0.75) return "green";
  if (ratio >= 0.25) return "amber";
  return "red";
}

export function getStatusBgClass(status: "green" | "amber" | "red"): string {
  switch (status) {
    case "green":
      return "bg-green-500";
    case "amber":
      return "bg-amber-500";
    case "red":
      return "bg-red-500";
  }
}

export function getStatusTextClass(status: "green" | "amber" | "red"): string {
  switch (status) {
    case "green":
      return "text-green-600";
    case "amber":
      return "text-amber-600";
    case "red":
      return "text-red-600";
  }
}

export function getLiftStatusIcon(status: LiftStatus): { icon: string; colour: string } {
  switch (status) {
    case "O":
      return { icon: "✓", colour: "text-green-600" };
    case "F":
      return { icon: "✕", colour: "text-red-600" };
    case "P":
      return { icon: "⏳", colour: "text-amber-600" };
  }
}

export function getDifficultyColour(difficulty: PisteDifficulty | null): string {
  switch (difficulty) {
    case "V":
      return "bg-green-500";
    case "B":
      return "bg-blue-500";
    case "R":
      return "bg-red-500";
    case "N":
      return "bg-gray-900";
    default:
      return "bg-gray-400";
  }
}

export function getDifficultyLabel(difficulty: PisteDifficulty): string {
  switch (difficulty) {
    case "V":
      return "Green";
    case "B":
      return "Blue";
    case "R":
      return "Red";
    case "N":
      return "Black";
  }
}

export function formatTemp(celsius: number | null): string {
  if (celsius === null) return "—";
  return `${celsius}°`;
}

export function getWindArrow(direction: string | null): string {
  if (!direction) return "";
  const dir = direction.toUpperCase();
  if (dir.includes("NORD") && dir.includes("EST")) return "↗";
  if (dir.includes("NORD") && dir.includes("OUEST")) return "↖";
  if (dir.includes("SUD") && dir.includes("EST")) return "↘";
  if (dir.includes("SUD") && dir.includes("OUEST")) return "↙";
  if (dir.includes("NORD")) return "↑";
  if (dir.includes("SUD")) return "↓";
  if (dir.includes("EST")) return "→";
  if (dir.includes("OUEST")) return "←";
  return "";
}

export function getAvalancheRiskColour(risk: number | null): string {
  if (risk === null) return "bg-gray-400";
  if (risk >= 4) return "bg-red-600";
  if (risk === 3) return "bg-amber-500";
  if (risk === 2) return "bg-yellow-400";
  return "bg-green-500";
}

export function getAvalancheRiskLabel(risk: number | null): string {
  if (risk === null) return "Unknown";
  switch (risk) {
    case 1:
      return "Low";
    case 2:
      return "Moderate";
    case 3:
      return "Considerable";
    case 4:
      return "High";
    case 5:
      return "Very High";
    default:
      return "Unknown";
  }
}

export function formatTimestamp(timestamp: string | null): string {
  if (!timestamp) return "Unknown";
  // Format: "09/01/2026 à 09:11" or ISO string
  if (timestamp.includes("à")) {
    return timestamp.replace("à", "at");
  }
  try {
    const date = new Date(timestamp);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timestamp;
  }
}

export function getSnowQualityLabel(quality: string | null): string {
  if (!quality) return "";
  const q = quality.toUpperCase();
  switch (q) {
    case "FRAICHE":
      return "Fresh";
    case "DOUCE":
      return "Soft";
    case "HUMIDE":
      return "Wet";
    case "CROUTE":
      return "Crusty";
    case "TRANSFORMÉE":
      return "Transformed";
    default:
      return quality;
  }
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
