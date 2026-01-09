export interface WeatherStation {
  location_name: string;
  elevation_m: number;
  temp_morning_c: number | null;
  temp_afternoon_c: number | null;
  weather_code_morning: string | null;
  wind_speed_kmh: number | null;
  wind_direction: string | null;
  snow_depth_cm: number | null;
  snow_quality: string | null;
  rain_snow_limit_m: number | null;
  last_snowfall_cm: number | null;
  last_snowfall_date: string | null;
  avalanche_risk: number | null;
}

export interface Lift {
  sector: string;
  lift_name: string;
  lift_type: string;
  status: "O" | "F" | "P"; // Open, Fermé, Planned
  opening_time: string;
  closing_time: string;
  status_message: string | null;
}

export interface Piste {
  sector: string;
  piste_name: string;
  difficulty: "V" | "B" | "R" | "N" | null; // Vert, Bleu, Rouge, Noir
  type: string;
  status: "O" | "F" | "P";
  grooming_level: number | null;
  status_message: string | null;
}

export interface Attraction {
  sector: string;
  lift_name: string;
  lift_type: string;
  status: "O" | "F" | "P";
  opening_time: string;
  closing_time: string;
  status_message: string | null;
}

export interface PistesByDifficulty {
  green: { open: number; total: number };
  blue: { open: number; total: number };
  red: { open: number; total: number };
  black: { open: number; total: number };
}

export interface CalculatedSummary {
  lifts_open: number;
  lifts_total: number;
  pistes_by_difficulty: PistesByDifficulty;
}

export interface Metadata {
  resort: string;
  source: string;
  scrape_timestamp: string;
  source_url: string;
}

export interface SkiData {
  metadata: Metadata;
  weather: WeatherStation[];
  lifts: Record<string, Lift[]>;
  pistes: Record<string, Piste[]>;
  attractions: Record<string, Attraction[]>;
  calculated_summary: CalculatedSummary;
  summary: {
    last_update_timestamp: string | null;
  };
}

export type LiftStatus = "O" | "F" | "P";
export type PisteDifficulty = "V" | "B" | "R" | "N";
