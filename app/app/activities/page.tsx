"use client";

import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import Nav from "@/app/components/Nav";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import gsap from "gsap";
import { History } from "lucide-react";

interface PredictionResult {
  rank: number;
  label: string;
  confidence: number;
}

interface Activity {
  id: string;
  image_name: string;
  inference_ms: number;
  created_at: string;
  results: PredictionResult[];
}

export default function ActivitiesPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      setError("Please log in to view your activities.");
      setLoading(false);
      return;
    }

    const fetchActivities = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/activities/?uid=${user.uid}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }
        const data = await response.json();
        // Since we want newest activities roughly first if they aren't sorted, we might want to map or reverse
        setActivities(
          data.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          ),
        );
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, userLoading]);

  // GSAP animation logic isolated in useLayoutEffect
  useLayoutEffect(() => {
    if (!loading && activities.length >= 0 && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".page-title",
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        );
        gsap.fromTo(
          ".activity-card",
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.2,
          },
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, activities]);

  return (
    <div className="min-h-screen bg-background text-on-background font-sans selection:bg-primary-container selection:text-on-primary-container">
      <Nav />
      {/* Decorative ambient background glows using theme colors */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <main ref={containerRef} className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-14">
          <h1 className="page-title text-4xl md:text-5xl font-extrabold tracking-tight text-primary opacity-0 mt-5">
            Analysis History
          </h1>
          <p className="page-title text-on-surface-variant mt-3 text-lg max-w-2xl opacity-0">
            Review your past plant disease diagnoses. Comprehensive results
            tailored for agricultural clarity.
          </p>
        </div>

        {userLoading || loading ? (
          <div className="flex justify-center items-center py-32 rounded-3xl bg-surface-container border border-outline-variant/30 soft-shadow">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-primary mb-4"></div>
              <p className="text-on-surface-variant font-medium tracking-wide">
                Loading records...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-error-container border border-error/20 text-on-error-container p-8 rounded-3xl soft-shadow">
            <div className="flex items-center mb-2">
              <svg
                className="w-6 h-6 mr-3 text-error"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="font-semibold text-xl">
                Could not load activities
              </h3>
            </div>
            <p className="text-on-error-container/80 pl-9">{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-surface-container-low border border-outline-variant/50 p-16 rounded-3xl text-center soft-shadow">
            <div className="w-20 h-20 bg-surface-variant rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <History className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-3 tracking-tight">
              No records found
            </h3>
            <p className="text-on-surface-variant max-w-sm mx-auto">
              Upload an image of a plant leaf in the Diagnosis tab to see your
              records appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------
// Activity Card Component Isolated Logic
// ----------------------------------------------------------------------
function ActivityCard({ activity }: { activity: Activity }) {
  const date = new Date(activity.created_at);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  const topResult =
    activity.results && activity.results.length > 0
      ? activity.results[0]
      : null;
  const otherResults =
    activity.results && activity.results.length > 1
      ? activity.results.slice(1, 4)
      : [];

  const formatLabel = (label: string) => {
    return label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const isHealthy = topResult?.label.toLowerCase().includes("healthy");

  // Calculate confidence styles using theme colors via Tailwind Utilities
  const confPercent = topResult ? Math.round(topResult.confidence * 100) : 0;

  let confColor = "text-on-surface-variant";
  let confBg = "bg-surface-variant border-outline-variant";
  let ConfIcon = null;

  if (confPercent > 85) {
    confColor = "text-on-primary-container";
    confBg = "bg-primary-container border-primary/20";
    ConfIcon = (
      <svg
        className="w-3.5 h-3.5 mr-1.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M5 13l4 4L19 7"
        />
      </svg>
    );
  } else if (confPercent > 50) {
    confColor = "text-on-secondary-container";
    confBg = "bg-secondary-container border-secondary/20";
    ConfIcon = (
      <svg
        className="w-3.5 h-3.5 mr-1.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    );
  } else {
    confColor = "text-on-error-container";
    confBg = "bg-error-container border-error/20";
    ConfIcon = (
      <svg
        className="w-3.5 h-3.5 mr-1.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }

  return (
    <div className="activity-card opacity-0 rounded-[var(--radius-lg)] relative overflow-hidden bg-surface-container-low border border-outline-variant shadow-sm hover:shadow-md hover:bg-surface-container transition-all duration-300 group flex flex-col">
      {/* Decorative hover gradient strictly handled by css opacity */}
      <div
        className={`absolute -inset-20 opacity-0 group-hover:opacity-10 blur-3xl rounded-full transition-opacity duration-700 pointer-events-none ${isHealthy ? "bg-primary" : "bg-transparent"}`}
        style={{
          transform: "translate(60%, -60%)",
          width: "250px",
          height: "250px",
          right: 0,
          top: 0,
        }}
      />

      {/* Visual Image Banner */}
      <div className="w-full h-48 relative overflow-hidden border-b border-outline-variant/30 flex-shrink-0 bg-surface-variant">
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}/activities/image/${activity.image_name}`}
          alt={`Crop analysis for ${activity.image_name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
          loading="lazy"
        />
        {/* Subtle inner shadow for premium depth */}
        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none" />
      </div>

      <div className="p-6 relative z-10 flex flex-col flex-grow space-y-5">
        {/* Date and Status Badge */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center text-xs font-semibold text-on-surface-variant tracking-widest uppercase">
              <svg
                className="w-3.5 h-3.5 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formattedDate} &bull; {formattedTime}
            </div>
          </div>

          {topResult && (
            <div
              className={`px-3 py-1.5 rounded-xl border ${confBg} flex items-center shadow-sm`}
            >
              {ConfIcon}
              <span
                className={`font-bold font-mono text-sm tracking-tight ${confColor}`}
              >
                {confPercent}%
              </span>
            </div>
          )}
        </div>

        {/* Primary Diagnosis */}
        <div className="mb-2">
          <p className="text-sm text-on-surface-variant mb-1">Primary Match</p>
          <h3 className="text-xl font-bold text-on-surface tracking-tight leading-tight group-hover:text-primary transition-colors duration-300">
            {topResult ? formatLabel(topResult.label) : "Unknown Diagnosis"}
          </h3>
        </div>

        {/* Inference Stats Line */}
        <div className="flex items-center space-x-5 text-sm text-on-surface-variant bg-surface-container-high p-3 rounded-[var(--radius-DEFAULT)] border border-outline-variant/50">
          <div className="flex items-center font-mono">
            <svg
              className="w-4 h-4 mr-2 opacity-70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>{(activity.inference_ms / 1000).toFixed(2)}s</span>
          </div>
          <div
            className="flex items-center font-mono truncate border-l border-outline-variant pl-5"
            title={activity.image_name}
          >
            <svg
              className="w-4 h-4 mr-2 opacity-70 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="truncate text-xs">
              ...{activity.image_name.slice(-15)}
            </span>
          </div>
        </div>

        {/* Secondary Results */}
        {otherResults.length > 0 && (
          <div className="pt-5 mt-auto border-t border-outline-variant/60">
            <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-3 flex items-center">
              Alternative Matches
            </p>
            <div className="space-y-2.5">
              {otherResults.map((res) => (
                <div
                  key={res.label}
                  className="flex items-center justify-between group/row"
                >
                  <span
                    className="text-sm text-on-surface-variant truncate pr-4 group-hover/row:text-on-surface transition-colors"
                    title={formatLabel(res.label)}
                  >
                    {formatLabel(res.label)}
                  </span>
                  <div className="flex items-center shrink-0 w-24">
                    {/* Tiny inline progress bar */}
                    <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden mr-3">
                      <div
                        className="h-full bg-primary/40 rounded-full group-hover/row:bg-primary transition-colors"
                        style={{
                          width: `${Math.max(res.confidence * 100, 2)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-on-surface-variant font-mono text-xs w-8 text-right">
                      {(res.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
