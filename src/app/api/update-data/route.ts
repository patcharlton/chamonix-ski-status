import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// Secret key for authentication - set this in your environment variables
const API_SECRET = process.env.DATA_UPDATE_SECRET || "change-me-in-production";

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get("authorization");
    const providedSecret = authHeader?.replace("Bearer ", "");

    if (providedSecret !== API_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the incoming JSON
    const data = await request.json();

    // Validate basic structure
    if (!data.metadata || !data.lifts || !data.weather) {
      return NextResponse.json(
        { error: "Invalid data structure - missing required fields" },
        { status: 400 }
      );
    }

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data");
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    // Save raw scraped data
    const rawPath = path.join(dataDir, "chamonix_ski_data.json");
    await writeFile(rawPath, JSON.stringify(data, null, 2), "utf-8");

    // Also run normalisation and save to public
    const cleanedData = normaliseData(data);
    const publicPath = path.join(process.cwd(), "public", "data.json");
    await writeFile(publicPath, JSON.stringify(cleanedData, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: "Data updated successfully",
      timestamp: new Date().toISOString(),
      lifts_total: Object.values(data.lifts).flat().length,
    });
  } catch (error) {
    console.error("Error updating data:", error);
    return NextResponse.json(
      { error: "Failed to process data" },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "POST /api/update-data",
    description: "Send scraped Chamonix ski data as JSON body with Bearer token",
  });
}

// Inline normalisation (simplified version)
function normaliseData(data: Record<string, unknown>): Record<string, unknown> {
  const LIFT_TYPES = new Set(["TPH", "TC", "TSD", "TS", "TK", "FUNI", "TAPIS", "ASCENSEUR"]);

  const lifts = data.lifts as Record<string, Array<Record<string, unknown>>>;
  const pistes = data.pistes as Record<string, Array<Record<string, unknown>>>;

  const normalisedLifts: Record<string, Array<Record<string, unknown>>> = {};
  const attractions: Record<string, Array<Record<string, unknown>>> = {};

  // Process lifts - dedupe and categorise
  for (const [sector, sectorLifts] of Object.entries(lifts)) {
    const seen = new Set<string>();
    const realLifts: Array<Record<string, unknown>> = [];
    const sectorAttractions: Array<Record<string, unknown>> = [];

    for (const lift of sectorLifts) {
      const name = lift.lift_name as string;
      if (seen.has(name)) continue;
      seen.add(name);

      const liftType = (lift.lift_type as string || "").toUpperCase();
      if (LIFT_TYPES.has(liftType)) {
        realLifts.push(lift);
      } else {
        sectorAttractions.push(lift);
      }
    }

    normalisedLifts[sector] = realLifts;
    if (sectorAttractions.length > 0) {
      attractions[sector] = sectorAttractions;
    }
  }

  // Process pistes - dedupe
  const normalisedPistes: Record<string, Array<Record<string, unknown>>> = {};
  for (const [sector, sectorPistes] of Object.entries(pistes)) {
    const seen = new Set<string>();
    normalisedPistes[sector] = sectorPistes.filter((p) => {
      const name = p.piste_name as string;
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }

  // Calculate summary
  let liftsOpen = 0;
  let liftsTotal = 0;
  const pistesByDifficulty = {
    green: { open: 0, total: 0 },
    blue: { open: 0, total: 0 },
    red: { open: 0, total: 0 },
    black: { open: 0, total: 0 },
  };

  const difficultyMap: Record<string, keyof typeof pistesByDifficulty> = {
    V: "green", B: "blue", R: "red", N: "black",
  };

  for (const sectorLifts of Object.values(normalisedLifts)) {
    for (const lift of sectorLifts) {
      liftsTotal++;
      if (lift.status === "O") liftsOpen++;
    }
  }

  for (const sectorPistes of Object.values(normalisedPistes)) {
    for (const piste of sectorPistes) {
      const diff = piste.difficulty as string;
      const mapped = difficultyMap[diff];
      if (mapped) {
        pistesByDifficulty[mapped].total++;
        if (piste.status === "O") pistesByDifficulty[mapped].open++;
      }
    }
  }

  return {
    ...data,
    lifts: normalisedLifts,
    pistes: normalisedPistes,
    attractions,
    calculated_summary: {
      lifts_open: liftsOpen,
      lifts_total: liftsTotal,
      pistes_by_difficulty: pistesByDifficulty,
    },
  };
}
