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
    []
  );
  const [aiAdvice, setAiAdvice] = useState<string[]>([]);

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
      setAiAdvice(newAdvice.length ? newAdvice : ["Continue routine monitoring. Environment stable."]);
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
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
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
        }
      );
    } else {
      setWeatherData((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  return (
    <div className="min-h-screen pb-32 bg-surface text-on-surface font-body overflow-x-hidden">
      <Nav />

      {/* Main Content Canvas */}
      <main className="pt-24 px-6 max-w-2xl mx-auto">
        {/* Header: Location */}
        <header className="mb-8 flex items-end justify-between">
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
        </header>

        {/* Weather Summary Strip */}
        <section className="bg-surface-container-low rounded-lg p-5 mb-8 shadow-sm overflow-x-auto no-scrollbar">
          <div className="flex justify-between items-center min-w-[400px]">
            <div className="flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-primary mb-1">
                thermostat
              </span>
              <span className="font-bold text-lg">
                {weatherData.loading ? "--" : `${weatherData.temp}°C`}
              </span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant/60">
                Temp
              </span>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/30"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-primary mb-1">
                rainy
              </span>
              <span className="font-bold text-lg">
                {weatherData.loading ? "--" : `${weatherData.rain}%`}
              </span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant/60">
                Rain
              </span>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/30"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-primary mb-1">
                humidity_mid
              </span>
              <span className="font-bold text-lg">
                {weatherData.loading ? "--" : `${weatherData.humidity}%`}
              </span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant/60">
                Humidity
              </span>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/30"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-primary mb-1">
                cloud
              </span>
              <span className="font-bold text-lg">
                {weatherData.loading ? "--" : `${weatherData.clouds}%`}
              </span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant/60">
                Clouds
              </span>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/30"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-primary mb-1">
                air
              </span>
              <span className="font-bold text-lg">
                {weatherData.loading ? "--" : `${weatherData.windSpeed}m/s`}
              </span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant/60">
                Wind
              </span>
            </div>
          </div>
        </section>

        {/* Alerts Section (Optional based on data) */}
        {alerts.length > 0 && (
          <section className="mb-8 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60 px-1 mb-2">
              Critical Alerts
            </h2>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-l-4 ${
                  alert.severity === "High"
                    ? "bg-error-container/20 border-error"
                    : "bg-warning-container/20 border-warning"
                }`}
              >
                <span
                  className={`material-symbols-outlined ${
                    alert.severity === "High" ? "text-error" : "text-warning"
                  }`}
                >
                  {alert.type === "Weather" ? "error" : "fmd_bad"}
                </span>
                <p className="text-sm font-bold text-on-surface">
                  {alert.message}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Filter Bar */}
        <section className="mb-8 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <button className="flex items-center gap-2 bg-surface-container-highest px-5 py-3 rounded-full hover:bg-primary-container/20 transition-colors">
            <span className="material-symbols-outlined text-primary text-xl">
              opacity
            </span>
            <span className="text-sm font-semibold whitespace-nowrap">
              Water Needs
            </span>
          </button>
          <button className="flex items-center gap-2 bg-surface-container-highest px-5 py-3 rounded-full hover:bg-primary-container/20 transition-colors">
            <span className="material-symbols-outlined text-primary text-xl">
              partly_cloudy_day
            </span>
            <span className="text-sm font-semibold whitespace-nowrap">
              Season
            </span>
          </button>
          <button className="flex items-center gap-2 bg-surface-container-highest px-5 py-3 rounded-full hover:bg-primary-container/20 transition-colors">
            <span className="material-symbols-outlined text-primary text-xl">
              potted_plant
            </span>
            <span className="text-sm font-semibold whitespace-nowrap">
              Crop Type
            </span>
          </button>
        </section>

        {/* Main Area: Ranked Crop Cards */}
        <section className="space-y-4">
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-xl font-bold font-headline">
              Your Crop Advisory
            </h2>
            <span className="text-xs font-bold text-primary">Live Insights</span>
          </div>

          {!weatherData.loading ? (
            recommendations.map((crop) => (
              <div
                key={crop.id}
                className="bg-surface-container-lowest rounded-lg p-4 flex gap-4 items-center shadow-[0_10px_40px_rgba(24,29,25,0.04)] active:scale-[0.98] transition-transform"
              >
                <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-lg">
                  <img
                    className="w-full h-full object-cover"
                    alt={crop.name}
                    src={crop.image}
                  />
                  <div className="absolute top-1 left-1 bg-primary text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                    {crop.status}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-extrabold text-lg truncate font-headline">
                      {crop.name}
                    </h3>
                    <div className="bg-secondary-container px-2 py-0.5 rounded-full">
                      <span className="text-[10px] font-black text-on-secondary-container">
                        {crop.matchScore}% MATCH
                      </span>
                    </div>
                  </div>
                   <p className="text-on-surface-variant text-xs leading-relaxed line-clamp-2">
                    {crop.advice}
                  </p>
                </div>
                <span className="material-symbols-outlined text-outline">
                  chevron_right
                </span>
              </div>
            ))
          ) : (
             <div className="p-8 text-center text-on-surface-variant/40 italic">
               Calculating personalized recommendations...
             </div>
          )}
        </section>

        {/* CTA / Advisory Insight */}
        <section className="mt-10 p-6 bg-gradient-to-br from-[#486808] to-[#85a947] rounded-lg text-white shadow-xl">
          <div className="flex items-start gap-4">
            <span
              className="material-symbols-outlined text-3xl opacity-80"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              psychology
            </span>
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-2 font-headline">
                AI Advisory Insight
              </h4>
              <ul className="space-y-2">
                {aiAdvice.map((advice, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/90">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-white shrink-0"></span>
                    {advice}
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Confidence: 89%
                </span>
                <button className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors">
                  Full Analysis
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

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
