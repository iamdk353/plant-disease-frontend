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
    [],
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
