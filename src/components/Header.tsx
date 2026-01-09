import { formatTimestamp } from "@/lib/utils";

interface HeaderProps {
  resort: string;
  lastUpdate: string | null;
}

export function Header({ resort, lastUpdate }: HeaderProps) {
  return (
    <header className="mb-4">
      <h1 className="text-2xl font-bold text-gray-900">{resort}</h1>
      <p className="text-sm text-gray-500">
        Updated: {formatTimestamp(lastUpdate)}
      </p>
    </header>
  );
}
