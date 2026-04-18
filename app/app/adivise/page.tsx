"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";
import Nav from "../../components/Nav";

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
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

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
            .slice(0, 5) // Display only top 5 recent activities in the side bar
        );
      } catch (err) {
        console.error(err);
      } finally {
        setActivitiesLoading(false);
      }
    };
    fetchActivities();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

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
                <span className="material-symbols-outlined text-primary text-xl">
                  thermostat
                </span>
                <span className="font-bold text-sm text-on-surface">
                  {weatherData.loading ? "--" : `${weatherData.temp}°C`}
                </span>
              </div>
              <div className="h-4 w-[1px] bg-outline-variant/40"></div>
              <div className="flex items-center gap-2" title="Humidity">
                <span className="material-symbols-outlined text-primary text-xl">
                  humidity_mid
                </span>
                <span className="font-bold text-sm text-on-surface">
                  {weatherData.loading ? "--" : `${weatherData.humidity}%`}
                </span>
              </div>
              <div className="h-4 w-[1px] bg-outline-variant/40"></div>
              <div className="flex items-center gap-2" title="Cloud Cover">
                <span className="material-symbols-outlined text-primary text-xl">
                  cloud
                </span>
                <span className="font-bold text-sm text-on-surface">
                  {weatherData.loading ? "--" : `${weatherData.clouds}%`}
                </span>
              </div>
              <div className="h-4 w-[1px] bg-outline-variant/40"></div>
              <div className="flex items-center gap-2" title="Wind Speed">
                <span className="material-symbols-outlined text-primary text-xl">
                  air
                </span>
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
                <span
                  className={`material-symbols-outlined text-lg ${
                    alert.severity === "High" ? "text-error" : "text-primary"
                  }`}
                >
                  {alert.type === "Weather" ? "thermostat" : "fmd_bad"}
                </span>
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
              <Link href="/app/activities" className="text-xs font-bold text-primary hover:underline">
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
                  const isHealthy = topResult.label.toLowerCase().includes("healthy");

                  return (
                    <div
                      key={activity.id}
                      onClick={() => setSelectedActivity(activity)}
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
                            {new Date(activity.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                          </p>
                        </div>
                        <h3 className="font-bold text-sm text-on-surface leading-tight truncate font-headline pb-0.5">
                          {topResult.label.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
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

          {/* Right Column: 70% - Story Interface Grid */}
          <div className="w-full md:w-[70%]">
            <h2 className="text-xl font-bold font-headline mb-4 text-on-surface">
              Advisory Stories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((storyId) => (
                <div
                  key={storyId}
                  onClick={() =>
                    setSelectedStory({
                      id: storyId,
                      title: `Advisory Story ${storyId}`,
                      description:
                        "Detailed information about this specific advisory story goes here. This provides the user with in-depth knowledge and actionable steps to improve their crop yield and handle unexpected issues in the field.",
                      image: `https://picsum.photos/400/600?random=${storyId}`,
                    })
                  }
                  className="aspect-[3/4] bg-surface-variant rounded-2xl cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden relative group"
                >
                  <img
                    src={`https://picsum.photos/400/600?random=${storyId}`}
                    alt={`Story ${storyId}`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                  {/* Content */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col gap-1">
                    <div className="flex gap-1 mb-1">
                      <span className="w-8 h-1 bg-white/80 rounded-full"></span>
                      <span className="w-8 h-1 bg-white/30 rounded-full"></span>
                      <span className="w-8 h-1 bg-white/30 rounded-full"></span>
                    </div>
                    <h3 className="text-white font-bold font-headline text-sm leading-tight drop-shadow-md">
                      Advisory Story {storyId}
                    </h3>
                    <p className="text-white/80 text-[10px] font-medium drop-shadow-md">
                      Tap to view details
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Overlay for Stories */}
        {selectedStory && (
          <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedStory(null)}
          >
            <div
              className="bg-surface rounded-[2rem] w-full max-w-md overflow-hidden relative shadow-2xl cursor-auto animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors z-20 backdrop-blur-sm"
                onClick={() => setSelectedStory(null)}
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>

              {/* Modal Image */}
              <div className="h-64 w-full bg-surface-variant relative">
                <img
                  src={selectedStory.image}
                  alt={selectedStory.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
              </div>

              {/* Modal Content */}
              <div className="p-8 pt-2">
                <h2 className="text-3xl font-extrabold font-headline mb-3 text-on-surface">
                  {selectedStory.title}
                </h2>
                <p className="text-on-surface-variant text-sm leading-relaxed tracking-wide mb-8">
                  {selectedStory.description}
                </p>
                <button
                  className="w-full bg-primary text-on-primary py-4 rounded-full font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
                  onClick={() => setSelectedStory(null)}
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Overlay for Recent Activity */}
        {selectedActivity && (
          <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedActivity(null)}
          >
             <div
              className="bg-surface rounded-[2rem] w-[90%] md:w-[80%] h-[80%] overflow-hidden relative shadow-2xl cursor-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
                <h2 className="text-2xl font-bold font-headline text-on-surface truncate pr-4">
                  {selectedActivity.results[0].label.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </h2>
                <button
                  className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80 transition-colors"
                  onClick={() => setSelectedActivity(null)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center">
                 <div className="w-full max-w-lg aspect-square rounded-2xl overflow-hidden mb-8 shadow-lg ring-1 ring-outline-variant/20">
                   <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/activities/image/${selectedActivity.image_name}`}
                    alt="Activity Image"
                    className="w-full h-full object-cover"
                   />
                 </div>
                 
                 <div className="w-full max-w-lg space-y-4 pb-10">
                   <h3 className="text-xl font-bold font-headline">Diagnosis Details</h3>
                   <div className="space-y-3">
                     {selectedActivity.results.map((result, idx) => (
                       <div key={idx} className="flex items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                         <span className="font-bold text-sm text-on-surface capitalize">{result.label.replace(/_/g, " ")}</span>
                         <span className="text-xs font-black px-3 py-1 bg-primary text-on-primary rounded-full">
                           {(result.confidence * 100).toFixed(1)}%
                         </span>
                       </div>
                     ))}
                   </div>
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
            <span className="material-symbols-outlined mb-1">home</span>
            <span className="font-body text-[10px] font-bold uppercase tracking-widest">
              Home
            </span>
          </Link>
          <Link
            href="/app/diagnoise"
            className="flex flex-col items-center justify-center text-on-surface/60 p-2 hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined mb-1">camera_alt</span>
            <span className="font-body text-[10px] font-bold uppercase tracking-widest">
              Detect
            </span>
          </Link>
          <Link
            href="/app/adivise"
            className="flex flex-col items-center justify-center bg-gradient-to-br from-[#486808] to-[#85A947] text-white rounded-full p-4 scale-110 -translate-y-2 shadow-lg active:scale-90 transition-all duration-300 ease-out"
          >
            <span className="material-symbols-outlined">grass</span>
            <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-0.5">
              Advisory
            </span>
          </Link>
          <button className="flex flex-col items-center justify-center text-on-surface/60 p-2 hover:text-primary transition-all">
            <span className="material-symbols-outlined mb-1">person</span>
            <span className="font-body text-[10px] font-bold uppercase tracking-widest">
              Profile
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
