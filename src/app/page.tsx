"use client";

import { useEffect, useState } from "react";
import { SkiData } from "@/types/ski-data";
import { Header } from "@/components/Header";
import { QuickStats } from "@/components/QuickStats";
import { DomainList } from "@/components/DomainList";
import { ConditionsSummary } from "@/components/ConditionsSummary";
import { SkiGearRecommendation } from "@/components/SkiGearRecommendation";

export default function Home() {
  const [data, setData] = useState<SkiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((json: SkiData) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-32 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load ski data</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto p-4 pb-8">
        <Header
          resort={data.metadata.resort}
          lastUpdate={data.summary.last_update_timestamp}
        />

        {/* Quick stats bar - compact overview */}
        <QuickStats
          summary={data.calculated_summary}
          weather={data.weather}
        />

        {/* Main content: Ski Areas */}
        <section className="mb-6">
          <DomainList
            weather={data.weather}
            lifts={data.lifts}
            pistes={data.pistes}
          />
        </section>

        {/* Secondary info - collapsible */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            More Info
          </h2>
          <ConditionsSummary weather={data.weather} />
          <SkiGearRecommendation weather={data.weather} />
        </section>
      </div>
    </main>
  );
}
