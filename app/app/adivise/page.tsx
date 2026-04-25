"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";
import Nav from "../../components/Nav";
import {
  AlertTriangle,
  Brain,
  Camera,
  Cloud,
  Droplets,
  ExternalLink,
  Home,
  Leaf,
  LineChart,
  Loader2,
  Mountain,
  Pill,
  Search,
  ShieldCheck,
  ShoppingCart,
  Thermometer,
  User,
  Wind,
  X,
} from "lucide-react";

interface WeatherData {
  city: string;
  temp: number;
  humidity: number;
  rain: number;
  clouds: number;
  windSpeed: number;
  loading: boolean;
}

interface CropRecommendation {
  id: string;
  name: string;
  status: "Healthy" | "At Risk" | "Infected";
  matchScore: number;
  image: string;
  advice: string;
}

interface Alert {
  id: string;
  type: "Weather" | "Disease";
  message: string;
  severity: "High" | "Medium";
}

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
  report?: any;
}

export default function AdvisoryPage() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  const [weatherData, setWeatherData] = useState<WeatherData>({
    city: "Lagos, Nigeria",
    temp: 30,
    humidity: 75,
    rain: 20,
    clouds: 10,
    windSpeed: 5,
    loading: true,
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>(
    [],
  );
  const [aiAdvice, setAiAdvice] = useState<string[]>([]);
  const [soilType, setSoilType] = useState("Well-drained red soil");
  const [marketTrends, setMarketTrends] = useState("");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [cropPlan, setCropPlan] = useState<any | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [isFetchingReport, setIsFetchingReport] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const fetchActivities = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/activities/?uid=${user.uid}`,
          {
            headers: { "ngrok-skip-browser-warning": "true" },
          },
        );
        if (!response.ok) throw new Error("Failed to fetch activities");
        const data = await response.json();
        setActivities(
          data
            .sort(
              (a: Activity, b: Activity) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            )
            .slice(0, 5), // Display only top 5 recent activities in the side bar
        );
      } catch (err) {
        console.error(err);
      } finally {
        setActivitiesLoading(false);
      }
    };
    fetchActivities();
  }, [user]);

  const generateReport = async (activity: Activity) => {
    if (!activity) return;
    setIsFetchingReport(true);
    setSelectedReport(null);
    try {
      let locData: { lat: number; lon: number } | null = null;
      try {
        const getLoc = () =>
          new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 8000,
            });
          });
        const pos = await getLoc();
        locData = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      } catch {
        // location optional — backend uses it for weather context only
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // 1) Try GET first to fetch a cached report (no AI cost)
      try {
        const url = new URL(`${apiUrl}/api/ai/report`);
        url.searchParams.set("prediction_id", activity.id);
        if (locData) {
          url.searchParams.set("lat", String(locData.lat));
          url.searchParams.set("lon", String(locData.lon));
        }
        const getResp = await fetch(url.toString(), {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (getResp.ok) {
          const data = await getResp.json();
          if (data && (data.report || data.report_text)) {
            setSelectedReport(data);
            return;
          }
        }
      } catch (e) {
        // GET failed or no cached report — fall through to POST
        console.warn("GET /api/ai/report failed or no cached report", e);
      }

      // 2) No cached report found — POST to generate and save
      const postResp = await fetch(`${apiUrl}/api/ai/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ prediction_id: activity.id, location: locData }),
      });

      if (postResp.ok) {
        const data = await postResp.json();
        setSelectedReport(data);
      } else {
        console.error("Report generation failed", postResp.status);
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setIsFetchingReport(false);
    }
  };

  const loadReportIfExists = async (activity: Activity) => {
    if (!activity) return;
    setSelectedActivity(activity);
    setSelectedReport(null);

    // If activity already includes a report object, render it directly
    if (
      activity.report &&
      (activity.report.report || activity.report.report_text)
    ) {
      setSelectedReport(activity.report);
      return;
    }

    // Otherwise, try to fetch an existing report from the backend (do not trigger generation)
    try {
      setIsFetchingReport(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(
        `${apiUrl}/api/ai/report?prediction_id=${activity.id}`,
        {
          headers: { "ngrok-skip-browser-warning": "true" },
        },
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data && (data.report || data.report_text)) {
          setSelectedReport(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch existing report:", err);
    } finally {
      setIsFetchingReport(false);
    }
  };

  const fetchCropRecommendation = async () => {
    if (!user) return;

    // Check localStorage cache first to abide by the "one row per person" backend constraint
    // and prevent unnecessary LLM spam if requested within a 24-hour window
    const cacheKey = `ai_crop_plan_${user.uid}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const ageHours = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
        if (ageHours < 24 && parsed.data) {
          setCropPlan(parsed.data);
          return;
        }
      } catch (err) {
        console.warn("Invalid cache for crop plan, fetching fresh.");
      }
    }

    setIsGeneratingPlan(true);

    let locData = null;
    try {
      const getLoc = () =>
        new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
          });
        });
      const position = await getLoc();
      locData = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };
    } catch (locErr) {
      console.warn("Could not fetch location:", locErr);
      // Fallback default coordinates if location fails (e.g., center of Karnataka to fit the knowledge base)
      locData = { lat: 15.3173, lon: 75.7139 };
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const payload = {
        uid: user.uid,
        location: locData,
      };

      const response = await fetch(`${apiUrl}/api/ai/crop-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch crop plan");
      }

      const data = await response.json();
      setCropPlan(data); // saving the full response including deduced_soil_type

      // Save directly to localStorage caching
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          data: data,
        }),
      );
    } catch (error) {
      console.error("Error generating crop plan:", error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleRegeneratePlan = async () => {
    if (!user) return;
    try {
      const cacheKey = `ai_crop_plan_${user.uid}`;
      localStorage.removeItem(cacheKey);
      setCropPlan(null);
      // Trigger a fresh fetch which will bypass cache
      await fetchCropRecommendation();
    } catch (err) {
      console.error("Failed to regenerate plan:", err);
      alert("Could not regenerate plan. Please try again.");
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Restore cached crop plan (keeps UI state across route changes)
  useEffect(() => {
    if (!user) return;
    try {
      const cacheKey = `ai_crop_plan_${user.uid}`;
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return;
      const parsed = JSON.parse(cached);
      const ageHours = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
      if (ageHours < 24 && parsed.data) {
        setCropPlan(parsed.data);
      }
    } catch (err) {
      console.warn("Failed to restore cached crop plan:", err);
    }
  }, [user]);

  useEffect(() => {
    const generateAdvisory = () => {
      const newAlerts: Alert[] = [];
      const newAdvice: string[] = [];

      // Weather Rules
      if (weatherData.humidity > 80) {
        newAlerts.push({
          id: "1",
          type: "Weather",
          message: "High humidity: Fungal risk increased",
          severity: "Medium",
        });
        newAdvice.push("Apply preventive fungicide to young crops.");
      }

      if (weatherData.temp > 35) {
        newAlerts.push({
          id: "2",
          type: "Weather",
          message: "Heatwave Alert: Soil moisture dropping",
          severity: "High",
        });
        newAdvice.push("Shift irrigation to evening to prevent evaporation.");
      }

      if (weatherData.rain < 5 && weatherData.humidity < 40) {
        newAdvice.push("Initiate manual irrigation for water-intensive plots.");
      } else if (weatherData.rain > 50) {
        newAdvice.push("Check drainage systems for Plot B to avoid root rot.");
      }

      // Mock Crop Personalization
      const mockCrops: CropRecommendation[] = [
        {
          id: "c1",
          name: "Maize",
          status: weatherData.humidity > 70 ? "At Risk" : "Healthy",
          matchScore: 92,
          image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCdndc6NOjEUdNCKHB09s-RS7jhj9h22M6I73fmRNanBGerefQe0fTYMFXEJPg78e-o6Vs8ly94Y645o493iubGsYL1odN3d0KUzOULtqv2qRSEKHuvLUPGLlTHmzPiH1DuS11rJGNNv4rM-JjWUZ1g9N7wg84D0m0YLv7iDjWukWnxgMx-CWV1zQe0u0EirkDFljWLH9jPmkr3onMhC_4WMapaTbPPKPkfpWYpWpLoDZlRcH-_rC8qq5vfOxZ72xSZdR4hnpBfTEOT",
          advice:
            weatherData.humidity > 70
              ? "Monitor for downy mildew."
              : "Ideal growth conditions.",
        },
        {
          id: "c2",
          name: "Cassava",
          status: "Healthy",
          matchScore: 88,
          image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBiIZM2NF3Vj8lQqgmcXHoKVU3xErJVkqOUi4KyKfMaTd8e7_eHhs4b-AJSJ0ZMjYbF6aYuaQnrnWCPM76Uxd_7o2RM_OgH8_EL_7XIfZLADBE5ZNk-Wn-PO455M2YTLRR06dim4dRNh3wM5YbKDs8GLjP_7gIegjYBgBc4ghnaMsyRLCXmiEeIv78HKHHjfpVALenfa_Mq0FMNrx2SBfiGwB-775lBLSXJnVwio93Srt75w8FTPzVa75CeQeC0RGa0_4rEcd4pPwte",
          advice: "Maintain current mulching strategy.",
        },
      ];

      setAlerts(newAlerts);
      setRecommendations(mockCrops);
      setAiAdvice(
        newAdvice.length
          ? newAdvice
          : ["Continue routine monitoring. Environment stable."],
      );
    };

    if (!weatherData.loading) {
      generateAdvisory();
    }
  }, [weatherData]);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API;
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
          {
            headers: { "ngrok-skip-browser-warning": "true" },
          },
        );
        const data = await response.json();

        setWeatherData({
          city: data.name || "Current Location",
          temp: Math.round(data.main.temp),
          humidity: data.main.humidity,
          rain: data.rain?.["1h"] ? Math.round(data.rain["1h"]) : 0,
          clouds: data.clouds?.all || 0,
          windSpeed: data.wind?.speed || 0,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
        setWeatherData((prev) => ({ ...prev, loading: false }));
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setWeatherData((prev) => ({ ...prev, loading: false }));
        },
      );
    } else {
      setWeatherData((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  return (
    <div className="min-h-screen pb-32 bg-surface text-on-surface font-body overflow-x-hidden">
      <Nav />

      {/* Main Content Canvas */}
      <main className="pt-24 px-6 max-w-4xl mx-auto">
        {/* Header: Location */}
        <header className="mb-6  flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 block mb-1">
              Your Region
            </span>
            <div className="flex items-center gap-2 group cursor-pointer">
              <h1 className="text-3xl font-extrabold text-on-surface tracking-tight font-headline">
                {weatherData.loading ? "Locating..." : weatherData.city}
              </h1>
            </div>
          </div>

          {/* Weather Summary Strip */}
          <section className="bg-surface-container-low rounded-full px-5 py-2 shadow-sm border border-outline-variant/30 inline-flex self-start md:self-auto ">
            <div className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-2" title="Temperature">
                <Thermometer className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm text-on-surface">
                  {weatherData.loading ? "--" : `${weatherData.temp}°C`}
                </span>
              </div>
              <div className="h-4 w-[1px] bg-outline-variant/40"></div>
              <div className="flex items-center gap-2" title="Humidity">
                <Droplets className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm text-on-surface">
                  {weatherData.loading ? "--" : `${weatherData.humidity}%`}
                </span>
              </div>
              <div className="h-4 w-[1px] bg-outline-variant/40"></div>
              <div className="flex items-center gap-2" title="Cloud Cover">
                <Cloud className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm text-on-surface">
                  {weatherData.loading ? "--" : `${weatherData.clouds}%`}
                </span>
              </div>
              <div className="h-4 w-[1px] bg-outline-variant/40"></div>
              <div className="flex items-center gap-2" title="Wind Speed">
                <Wind className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm text-on-surface">
                  {weatherData.loading ? "--" : `${weatherData.windSpeed}m/s`}
                </span>
              </div>
            </div>
          </section>
        </header>

        {/* Alerts Section (Optional based on data) */}
        {alerts.length > 0 && (
          <section className="mb-8 flex flex-wrap gap-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border ${
                  alert.severity === "High"
                    ? "bg-error-container/20 border-error/50"
                    : "bg-outline-variant/10 border-outline-variant/50"
                } inline-flex`}
              >
                {alert.type === "Weather" ? (
                  <Thermometer
                    className={`h-5 w-5 ${
                      alert.severity === "High" ? "text-error" : "text-primary"
                    }`}
                  />
                ) : (
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      alert.severity === "High" ? "text-error" : "text-primary"
                    }`}
                  />
                )}
                <p className="text-xs md:text-sm font-bold text-on-surface">
                  {alert.message}
                </p>
              </div>
            ))}
          </section>
        )}
      </main>
      <section className="px-6 max-w-6xl mx-auto pb-24 mt-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: 30% - List of Items */}
          <div className="w-full md:w-[30%] shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-headline text-on-surface">
                Recent Activity
              </h2>
              <Link
                href="/app/activities"
                className="text-xs font-bold text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {activitiesLoading ? (
                <div className="p-4 text-center text-on-surface-variant/50 text-sm italic">
                  Loading activities...
                </div>
              ) : activities.length > 0 ? (
                activities.map((activity) => {
                  const topResult = activity.results[0];
                  const isHealthy = topResult.label
                    .toLowerCase()
                    .includes("healthy");

                  return (
                    <div
                      key={activity.id}
                      onClick={() => loadReportIfExists(activity)}
                      className="p-3 bg-surface-container-low rounded-xl shadow-sm border border-outline-variant/30 flex items-center gap-3 cursor-pointer hover:bg-surface-container transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/activities/image/${activity.image_name}`}
                          alt={topResult.label}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {isHealthy ? (
                            <span className="w-2 h-2 rounded-full bg-secondary"></span>
                          ) : topResult.confidence > 0.6 ? (
                            <span className="w-2 h-2 rounded-full bg-error"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-warning"></span>
                          )}
                          <p className="text-[10px] uppercase font-bold text-on-surface-variant/60 truncate tracking-wider">
                            {new Date(activity.created_at).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" },
                            )}
                          </p>
                        </div>
                        <h3 className="font-bold text-sm text-on-surface leading-tight truncate font-headline pb-0.5">
                          {topResult.label
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </h3>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-on-surface-variant/50 text-sm">
                  No recent activity found.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: 70% - Crop Planner */}
          <div className="w-full md:w-[70%]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-headline text-on-surface">
                AI Crop Planner
              </h2>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Experimental
              </span>
            </div>

            <div className="bg-surface-container-low rounded-[2rem] p-6 md:p-8 shadow-sm border border-outline-variant/30 flex flex-col gap-6">
              <div>
                <p className="text-on-surface-variant text-sm mb-6 max-w-xl">
                  Generate sustainable crop cycles customized exactly to your
                  live soil profile, market trajectories, and localized weather
                  metrics.
                </p>

                {!cropPlan && (
                  <button
                    onClick={fetchCropRecommendation}
                    disabled={isGeneratingPlan}
                    className="w-full py-4 rounded-xl font-bold bg-primary text-on-primary shadow-md shadow-primary/20 hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                  >
                    {isGeneratingPlan ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Automatically Analyzing Environment...
                      </>
                    ) : (
                      <>
                        <LineChart className="h-5 w-5" />
                        Generate Strategy
                      </>
                    )}
                  </button>
                )}
              </div>

              {cropPlan && (
                <div className="border-t border-outline-variant/30 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                            Detected Soil Profile
                          </p>
                          <p className="text-on-surface font-headline font-bold text-lg">
                            {cropPlan.deduced_soil_type}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                          <Mountain className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <button
                        onClick={handleRegeneratePlan}
                        disabled={isGeneratingPlan}
                        className="px-4 py-2 rounded-full bg-surface-container-high border border-outline-variant text-sm font-bold hover:bg-surface-container-lowest transition disabled:opacity-60"
                      >
                        {isGeneratingPlan
                          ? "Regenerating..."
                          : "Regenerate Plan"}
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-5 text-on-surface flex items-center gap-2 font-headline">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Recommended Planting Schedule
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cropPlan.recommended_crops.map(
                      (crop: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-surface hover:bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/20 hover:border-primary/40 transition-colors group cursor-default"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shrink-0 shadow-sm shadow-primary/20 group-hover:scale-110 transition-transform">
                              {idx + 1}
                            </div>
                            <h4 className="font-bold text-lg text-on-surface leading-tight">
                              {crop.crop}
                            </h4>
                          </div>
                          <p className="text-sm text-on-surface-variant leading-relaxed">
                            {crop.reason}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Overlay for Recent Activity */}
        {selectedActivity && (
          <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
            onClick={() => {
              setSelectedActivity(null);
              setSelectedReport(null);
            }}
          >
            <div
              className="bg-surface rounded-[2rem] w-[90%] md:w-[80%] h-[80%] overflow-hidden relative shadow-2xl cursor-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
                <h2 className="text-2xl font-bold font-headline text-on-surface truncate pr-4">
                  {selectedActivity.results[0].label
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </h2>
                <button
                  className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80 transition-colors"
                  onClick={() => {
                    setSelectedActivity(null);
                    setSelectedReport(null);
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center">
                <div className="w-full max-w-lg space-y-4 pb-10">
                  {/* Image */}
                  <div className="w-full max-w-lg aspect-square rounded-2xl overflow-hidden shadow-lg ring-1 ring-outline-variant/20">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/activities/image/${selectedActivity.image_name}`}
                      alt="Activity Image"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* GENERATE BUTTON — shown when no report yet & not loading */}
                  {!isFetchingReport && !selectedReport && (
                    <>
                      <p className="text-sm text-on-surface-variant mb-3 text-center">
                        No AI report found for this activity. Press Generate to
                        create it.
                      </p>
                      <button
                        onClick={() => generateReport(selectedActivity)}
                        aria-label="Generate"
                        className="w-full py-4 rounded-2xl font-bold bg-primary text-on-primary shadow-md shadow-primary/20 hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <Brain className="h-5 w-5" />
                        Generate
                      </button>
                    </>
                  )}

                  {/* AI REPORT LOADING STATE */}
                  {isFetchingReport && (
                    <div className="mt-4 pt-6 border-t border-outline-variant/30 flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generating AI Analysis... (may take ~10s)
                      </div>
                      <div className="h-4 w-full bg-surface-variant/50 animate-pulse rounded-full"></div>
                      <div className="h-4 w-[80%] bg-surface-variant/50 animate-pulse rounded-full"></div>
                      <div className="h-24 w-full bg-surface-variant/50 animate-pulse rounded-xl mt-2"></div>
                    </div>
                  )}

                  {/* AI REPORT FULL RENDER */}
                  {!isFetchingReport &&
                    selectedReport &&
                    selectedReport.report && (
                      <>
                        <div className="pt-6 border-t border-outline-variant/30">
                          <h3 className="font-bold text-xl mb-3 font-headline text-primary flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" />
                            AI Expert Analysis
                          </h3>
                          <p className="text-sm text-on-surface-variant mb-5 leading-relaxed">
                            {selectedReport.report.report_text}
                          </p>

                          {selectedReport.expert_analysis && (
                            <div className="bg-primary/5 p-4 rounded-xl text-sm mb-5 border border-primary/10">
                              <p className="flex items-start gap-2">
                                <Search className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span>
                                  <strong>Cause:</strong>{" "}
                                  {selectedReport.expert_analysis.cause}
                                </span>
                              </p>
                              <p className="mt-3 flex items-start gap-2">
                                <Thermometer className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span>
                                  <strong>Weather Impact:</strong>{" "}
                                  {
                                    selectedReport.expert_analysis
                                      .weather_impact
                                  }
                                </span>
                              </p>
                            </div>
                          )}

                          {selectedReport.report.treatments &&
                            selectedReport.report.treatments.length > 0 && (
                              <div className="mb-5">
                                <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-on-surface">
                                  <Pill className="h-4 w-4" />
                                  Step-by-Step Treatment
                                </h4>
                                <div className="space-y-3">
                                  {selectedReport.report.treatments.map(
                                    (treatment: any, i: number) => (
                                      <div
                                        key={i}
                                        className="flex gap-3 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30"
                                      >
                                        <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold shrink-0">
                                          {i + 1}
                                        </div>
                                        <div className="text-sm">
                                          <p className="text-on-surface">
                                            {treatment.step}
                                          </p>
                                          {treatment.dosage && (
                                            <p className="text-xs text-primary font-bold mt-1 uppercase tracking-wider">
                                              {treatment.dosage}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                          {selectedReport.product_links &&
                            selectedReport.product_links.length > 0 && (
                              <div>
                                <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-on-surface">
                                  <ShoppingCart className="h-4 w-4" />
                                  Recommended Products
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedReport.product_links.map(
                                    (link: string, i: number) => {
                                      const domain = new URL(
                                        link,
                                      ).hostname.replace("www.", "");
                                      return (
                                        <a
                                          key={i}
                                          href={link}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="bg-surface-variant hover:bg-primary hover:text-on-primary text-on-surface text-xs font-bold px-3 py-2 rounded-full transition-colors flex items-center gap-1"
                                        >
                                          {domain}{" "}
                                          <ExternalLink className="h-3 w-3" />
                                        </a>
                                      );
                                    },
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full rounded-t-[3rem] z-50 bg-surface/90 backdrop-blur-2xl border-t border-on-surface/5 shadow-[0_-10px_40px_rgba(24,29,25,0.06)] md:hidden">
        <div className="flex justify-around items-center px-6 pb-8 pt-4">
          <Link
            href="/app"
            className="flex flex-col items-center justify-center text-on-surface/60 p-2 hover:text-primary transition-all"
          >
            <Home className="mb-1 h-5 w-5" />
            <span className="font-body text-[10px] font-bold uppercase tracking-widest">
              Home
            </span>
          </Link>
          <Link
            href="/app/diagnoise"
            className="flex flex-col items-center justify-center text-on-surface/60 p-2 hover:text-primary transition-all"
          >
            <Camera className="mb-1 h-5 w-5" />
            <span className="font-body text-[10px] font-bold uppercase tracking-widest">
              Detect
            </span>
          </Link>
          <Link
            href="/app/adivise"
            className="flex flex-col items-center justify-center bg-gradient-to-br from-[#486808] to-[#85A947] text-white rounded-full p-4 scale-110 -translate-y-2 shadow-lg active:scale-90 transition-all duration-300 ease-out"
          >
            <Leaf className="h-5 w-5" />
            <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-0.5">
              Advisory
            </span>
          </Link>
          <button className="flex flex-col items-center justify-center text-on-surface/60 p-2 hover:text-primary transition-all">
            <User className="mb-1 h-5 w-5" />
            <span className="font-body text-[10px] font-bold uppercase tracking-widest">
              Profile
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
