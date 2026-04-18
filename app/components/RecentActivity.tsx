"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface Activity {
  id: string;
  image_name: string;
  created_at: string;
  results: {
    label: string;
    confidence: number;
    rank: number;
  }[];
}

const RecentActivity = () => {
  const { user } = useCurrentUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchActivities = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/activities/?uid=${user.uid}`
        );
        if (!response.ok) throw new Error("Failed to fetch activities");
        const data = await response.json();
        setActivities(
          data
            .sort(
              (a: Activity, b: Activity) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            .slice(0, 3)
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [user]);

  return (
    <section>
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-xl font-bold tracking-tight font-headline">
          Recent Activity
        </h2>
        <Link
          href={"/app/activities"}
          className="text-sm font-bold text-primary hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="p-4 text-center text-on-surface-variant/50 text-sm italic">
            Loading activities...
          </div>
        ) : activities.length > 0 ? (
          activities.map((activity) => {
            const topResult = activity.results[0];
            const isHealthy = topResult.label.toLowerCase().includes("healthy");

            return (
              <Link
                href="/app/adivise"
                key={activity.id}
                className="flex items-center gap-6 p-4 bg-surface-container-low rounded-lg group hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-variant border border-outline-variant/30">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    alt={topResult.label}
                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/activities/image/${activity.image_name}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isHealthy ? (
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">
                        Healthy
                      </span>
                    ) : topResult.confidence > 0.6 ? (
                      <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold uppercase tracking-wider">
                        High Risk
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-warning-container text-on-warning-container text-[10px] font-bold uppercase tracking-wider">
                        Warning
                      </span>
                    )}
                    <span className="text-xs text-on-surface-variant font-medium truncate">
                      {new Date(activity.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-on-surface truncate capitalize">
                    {topResult.label.replace(/_/g, " ")}
                  </h4>
                  <p className="text-sm text-on-surface-variant">
                    Accuracy: {(topResult.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant opacity-40 group-hover:opacity-100 transition-opacity">
                  chevron_right
                </span>
              </Link>
            );
          })
        ) : (
          <div className="p-4 text-center text-on-surface-variant/50 text-sm">
            No recent activity found.
          </div>
        )}
      </div>
    </section>
  );
};
export default RecentActivity;
