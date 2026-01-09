interface IconProps {
  className?: string;
  size?: number;
}

// Lift Type Icons
export function CableCarIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 6h20M12 6v2M7 8h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="13" r="1" fill="currentColor" />
      <circle cx="12" cy="13" r="1" fill="currentColor" />
      <circle cx="16" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

export function GondolaIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 4h20M12 4v3M8 7h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 12h12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ChairliftIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 4h20M12 4v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 8h8v3H8zM8 11v5M16 11v5M6 16h4M14 16h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DragLiftIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 4h20M12 4v6M8 10h8M12 10v10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FunicularIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6l16 4M6 10h12a2 2 0 012 2v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CarpetLiftIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 8h16v8H4zM4 12h16M8 8v8M12 8v8M16 8v8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ElevatorIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M12 3v18M8 8l4-3 4 3M8 16l4 3 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Piste Difficulty Icons
export function GreenRunIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" fill="#22c55e" />
    </svg>
  );
}

export function BlueRunIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="20" height="20" rx="2" fill="#3b82f6" />
    </svg>
  );
}

export function RedRunIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L22 22H2L12 2Z" fill="#ef4444" />
    </svg>
  );
}

export function BlackRunIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="#1f2937" />
    </svg>
  );
}

// Helper to get lift icon by type
export function LiftTypeIcon({ type, className = "", size = 18 }: { type: string; className?: string; size?: number }) {
  const iconProps = { className, size };

  switch (type.toUpperCase()) {
    case "TPH":
      return <CableCarIcon {...iconProps} />;
    case "TC":
      return <GondolaIcon {...iconProps} />;
    case "TSD":
    case "TS":
      return <ChairliftIcon {...iconProps} />;
    case "TK":
      return <DragLiftIcon {...iconProps} />;
    case "FUNI":
      return <FunicularIcon {...iconProps} />;
    case "TAPIS":
      return <CarpetLiftIcon {...iconProps} />;
    case "ASCENSEUR":
      return <ElevatorIcon {...iconProps} />;
    default:
      return <ChairliftIcon {...iconProps} />;
  }
}

// Helper to get piste icon by difficulty
export function PisteDifficultyIcon({ difficulty, className = "", size = 14 }: { difficulty: string | null; className?: string; size?: number }) {
  const iconProps = { className, size };

  switch (difficulty) {
    case "V":
      return <GreenRunIcon {...iconProps} />;
    case "B":
      return <BlueRunIcon {...iconProps} />;
    case "R":
      return <RedRunIcon {...iconProps} />;
    case "N":
      return <BlackRunIcon {...iconProps} />;
    default:
      return null;
  }
}
