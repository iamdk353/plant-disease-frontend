"use client";
import { type ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Nav from "@/app/components/Nav";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  AtSign,
  Award,
  Brain,
  Calendar,
  Camera,
  Droplet,
  Home,
  Languages,
  LifeBuoy,
  LogOut,
  MapPin,
  Mountain,
  Pencil,
  Phone,
  Leaf,
  ShieldCheck,
  User,
} from "lucide-react";

const GOOGLE_TRANSLATE_STORAGE_KEY = "agrinex-preferred-language";
const GOOGLE_TRANSLATE_SCRIPT_ID = "google-translate-script";
const GOOGLE_TRANSLATE_CONTAINER_ID = "google_translate_element";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "kn", label: "Kannada" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "ml", label: "Malayalam" },
  { value: "hi", label: "Hindi" },
] as const;

type SupportedLanguage = (typeof LANGUAGE_OPTIONS)[number]["value"];

const SUPPORTED_LANGUAGE_SET = new Set<SupportedLanguage>(
  LANGUAGE_OPTIONS.map(({ value }) => value),
);

const INCLUDED_LANGUAGE_CODES = LANGUAGE_OPTIONS.filter(
  ({ value }) => value !== "en",
)
  .map(({ value }) => value)
  .join(",");

interface GoogleTranslateElementOptions {
  pageLanguage: string;
  includedLanguages: string;
  autoDisplay: boolean;
  layout?: string;
}

interface GoogleTranslateElementConstructor {
  new (options: GoogleTranslateElementOptions, elementId: string): unknown;
  InlineLayout: {
    SIMPLE: string;
  };
}

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: GoogleTranslateElementConstructor;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

const isSupportedLanguage = (
  value: string | null,
): value is SupportedLanguage => {
  if (!value) {
    return false;
  }

  return SUPPORTED_LANGUAGE_SET.has(value as SupportedLanguage);
};

const waitForGoogleTranslateCombo = async (
  attempts = 40,
): Promise<HTMLSelectElement | null> => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const combo = document.querySelector(".goog-te-combo");
    if (combo instanceof HTMLSelectElement) {
      return combo;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 250));
  }

  return null;
};

const applyGoogleTranslateLanguage = async (
  language: SupportedLanguage,
): Promise<boolean> => {
  const cookieValue = `/auto/${language}`;
  document.cookie = `googtrans=${cookieValue}; path=/`;

  const combo = await waitForGoogleTranslateCombo();
  if (!combo) {
    return false;
  }

  combo.value = language;

  const changeEvent = document.createEvent("HTMLEvents");
  changeEvent.initEvent("change", true, true);
  combo.dispatchEvent(changeEvent);

  return true;
};

export default function ProfilePage() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedLanguage>("en");
  const [hasLoadedLanguagePreference, setHasLoadedLanguagePreference] =
    useState(false);
  const [isTranslateReady, setIsTranslateReady] = useState(false);
  const [isApplyingLanguage, setIsApplyingLanguage] = useState(false);
  const [translateError, setTranslateError] = useState("");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const [location, setLocation] = useState<string>("Locating...");

  useEffect(() => {
    const restorePreferenceTimer = window.setTimeout(() => {
      const savedLanguage = window.localStorage.getItem(
        GOOGLE_TRANSLATE_STORAGE_KEY,
      );

      if (isSupportedLanguage(savedLanguage)) {
        setSelectedLanguage(savedLanguage);
      }

      setHasLoadedLanguagePreference(true);
    }, 0);

    return () => {
      window.clearTimeout(restorePreferenceTimer);
    };
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!hasLoadedLanguagePreference) {
      return;
    }

    window.localStorage.setItem(GOOGLE_TRANSLATE_STORAGE_KEY, selectedLanguage);
  }, [hasLoadedLanguagePreference, selectedLanguage]);

  useEffect(() => {
    let isCancelled = false;

    const mountGoogleTranslate = () => {
      const TranslateElement = window.google?.translate?.TranslateElement;
      if (!TranslateElement) {
        return false;
      }

      const container = document.getElementById(GOOGLE_TRANSLATE_CONTAINER_ID);
      if (!container) {
        return false;
      }

      if (!container.childNodes.length) {
        container.innerHTML = "";
        new TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: INCLUDED_LANGUAGE_CODES,
            autoDisplay: false,
            layout: TranslateElement.InlineLayout.SIMPLE,
          },
          GOOGLE_TRANSLATE_CONTAINER_ID,
        );
      }

      if (!isCancelled) {
        setIsTranslateReady(true);
        setTranslateError("");
      }

      return true;
    };

    window.googleTranslateElementInit = () => {
      mountGoogleTranslate();
    };

    if (mountGoogleTranslate()) {
      return () => {
        isCancelled = true;
      };
    }

    const existingScript = document.getElementById(
      GOOGLE_TRANSLATE_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onerror = () => {
        if (!isCancelled) {
          setTranslateError("Google Translate could not be loaded.");
        }
      };
      document.body.appendChild(script);
    }

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedLanguagePreference || !isTranslateReady) {
      return;
    }

    void applyGoogleTranslateLanguage(selectedLanguage).then((didApply) => {
      if (!didApply) {
        setTranslateError("Translation controls are still loading.");
        return;
      }

      setTranslateError("");
    });
  }, [hasLoadedLanguagePreference, isTranslateReady, selectedLanguage]);

  useEffect(() => {
    const fetchLocation = async (lat: number, lon: number) => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API;
        if (!apiKey) {
          setLocation("Unknown Location");
          return;
        }
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`,
          {
            headers: { "ngrok-skip-browser-warning": "true" },
          },
        );
        const data = await response.json();

        if (data.name && data.sys?.country) {
          setLocation(`${data.name}, ${data.sys.country}`);
        } else if (data.name) {
          setLocation(data.name);
        } else {
          setLocation("Unknown Location");
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        setLocation("Unknown Location");
      }
    };

    if (!("geolocation" in navigator)) {
      const unavailableTimer = window.setTimeout(() => {
        setLocation("Location Unavailable");
      }, 0);

      return () => {
        window.clearTimeout(unavailableTimer);
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocation("Location Access Denied");
      },
    );
  }, []);

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLanguage = event.target.value as SupportedLanguage;

    setSelectedLanguage(nextLanguage);
    setIsApplyingLanguage(true);
    setTranslateError("Applying language...");

    window.localStorage.setItem(GOOGLE_TRANSLATE_STORAGE_KEY, nextLanguage);
    document.cookie = `googtrans=/auto/${nextLanguage}; path=/`;

    window.setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32 font-body overflow-x-hidden">
      <Nav />
      <div
        id={GOOGLE_TRANSLATE_CONTAINER_ID}
        aria-hidden="true"
        className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
      />

      <main className="max-w-7xl mx-auto px-6 pt-24">
        {/* Profile Header Section */}
        <header className="relative mb-12">
          <div className="h-64 md:h-80 w-full rounded-xl overflow-hidden mb-[-4rem]">
            <img
              alt="Farm Background"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZXAIL_Imxil_exxFDG0pZrG1ArUPrxULi65RzaI26h9GhzBv-KSuc93XXw7Y29DSmfJDh5v14-WrsLNRB2Vcsd-xTgwZagnc8krag15J7frBkOkVH_35f6n2fpTRhQfNhHCPZzuUhlQTmBmaGeUpFU0IqM3U2fSc53o9FsbtPaC8u65wZkAOgyIVPn80HVwF4jPir0yTw5fC1esPMH_yWtkVveHBtjQb0pAQPWgbc9W3mXwiXyfr1Q5A22gXj9I2_Ow7XJnOJEGAt"
            />
          </div>
          <div className="relative flex flex-col md:flex-row items-end gap-6 px-4 md:px-12">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-xl border-8 border-surface overflow-hidden shadow-xl shadow-on-surface/5">
              <img
                alt="Farmer's profile picture"
                className="w-full h-full object-cover"
                src={
                  user?.photoURL ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuCBfDGKi_Kn77VTyx7Gqqx7L4GUJ3NjdEvxL5NNMar8cRe1IEsoU_B44GY3sxEwET8k482E0CSXUer2J8Fkzy4hUcG4lJvSsQCPUgVETjCwuJIskjao5DskYmpC4IqxgC3c_-GbhyGH-NEP88DWUPiXCNnOrO9Bgy9tAYcpSqvELxlzraBiuoNRygzpm3-13Z8S8cQ8MtHXLaf_cbUktgNtO7YzUq2UamXqtZF8IapWa03wsvjxy-CR9NZdwMof4AqWQx7WD9N1R3r4"
                }
              />
            </div>
            <div className="flex-1 pb-4">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
                  {user?.displayName || "Farmer"}
                </h1>
                <span className="bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Master Farmer
                </span>
              </div>
              <div className="flex items-center gap-4 text-on-surface-variant font-medium">
                <span className="flex items-center gap-1 transition-all">
                  <MapPin className="h-[18px] w-[18px]" /> {location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-[18px] w-[18px]" /> 15+ Years Exp.
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 pb-4  md:w-[500px]">
              <div className="flex flex-wrap gap-3">
                <button className="bg-gradient-to-br from-[#486808] to-[#85a947] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95 transition-transform">
                  <Pencil className="h-5 w-5" /> Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-surface-container-high text-on-surface-variant px-8 py-3 rounded-full font-bold border border-outline-variant/30 flex items-center gap-2 active:scale-95 transition-transform  hover:text-error hover:bg-surface-container-high"
                >
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              </div>

              <div className="rounded-2xl border border-outline-variant/30 bg-surface/90 p-4 shadow-sm backdrop-blur-sm">
                <label
                  className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant"
                  htmlFor="profile-language-select"
                >
                  <Languages className="h-4 w-4 text-primary" />
                  App Language
                </label>
                <select
                  id="profile-language-select"
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  disabled={!isTranslateReady || isApplyingLanguage}
                  className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {LANGUAGE_OPTIONS.map((language) => (
                    <option key={language.value} value={language.value}>
                      {language.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-on-surface-variant">
                  {translateError
                    ? translateError
                    : "Uses Google Translate and remembers your choice on this device. A quick refresh is used to apply the selected language reliably."}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Bento Grid Insights */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Farm Details Card */}
          <section className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold font-headline mb-8 flex items-center gap-3">
              <span className="w-1 h-8 bg-gradient-to-br from-[#486808] to-[#85a947] rounded-full"></span>
              Farm Insights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-2">
                <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">
                  Total area
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black font-headline text-primary">
                    12.5
                  </span>
                  <span className="text-on-surface font-semibold">
                    Hectares
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">
                  Primary crops
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-surface-container text-on-surface px-3 py-1 rounded-lg font-medium border border-outline-variant/10">
                    Maize
                  </span>
                  <span className="bg-surface-container text-on-surface px-3 py-1 rounded-lg font-medium border border-outline-variant/10">
                    Cassava
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">
                  Soil type
                </p>
                <div className="flex items-center gap-2">
                  <Mountain className="h-5 w-5 text-tertiary" />
                  <span className="text-xl font-bold text-on-surface">
                    Loamy Clay
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 rounded-lg bg-surface-container-low border-l-4 border-primary">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Seasonal Tip
              </h3>
              <p className="text-on-surface-variant leading-relaxed">
                Soil moisture levels in Kano are currently optimal for Cassava
                maturation. Consider adjusting irrigation cycles in Plot B to
                conserve water during the upcoming dry spell.
              </p>
            </div>
          </section>

          {/* Performance Badges */}
          <section className="md:col-span-4 bg-surface-container-low rounded-xl p-8">
            <h2 className="text-xl font-bold font-headline mb-6 text-on-surface">
              Achievements
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-on-surface">Organic Certified</p>
                  <p className="text-xs text-on-surface-variant">
                    Valid through Dec 2025
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-on-surface">Top Yield 2024</p>
                  <p className="text-xs text-on-surface-variant">
                    Top 5% in Region
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-lg shadow-sm opacity-60">
                <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                  <Droplet className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-on-surface">Water Saver</p>
                  <p className="text-xs text-on-surface-variant">
                    Complete 10 irrigation cycles
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact & Support */}
          <section className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Primary Phone
                </p>
                <p className="font-headline font-bold">+234 803 123 4567</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <AtSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Registered Email
                </p>
                <p className="font-headline font-bold">
                  {user?.email || "No email linked"}
                </p>
              </div>
            </div>
            <div className="bg-primary p-6 rounded-xl shadow-lg flex items-center justify-center gap-3 text-white cursor-pointer hover:bg-primary/90 transition-colors">
              <LifeBuoy className="h-5 w-5" />
              <span className="font-bold font-headline">Contact Support</span>
            </div>
          </section>
        </div>
      </main>

      {/* Bottom Navigation Bar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-2xl rounded-t-[3rem] shadow-[0_-10px_40px_rgba(24,29,25,0.06)] md:hidden">
        <div className="flex justify-around items-center px-6 pb-8 pt-4">
          <Link
            className="flex flex-col items-center justify-center text-on-surface/60 p-2 hover:text-primary active:scale-90 transition-all duration-300 ease-out"
            href="/app"
          >
            <Home className="h-5 w-5" />
            <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-1">
              Home
            </span>
          </Link>
          <Link
            className="flex flex-col items-center justify-center text-on-surface/60 p-2 hover:text-primary active:scale-90 transition-all duration-300 ease-out"
            href="/app/diagnoise"
          >
            <Camera className="h-5 w-5" />
            <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-1">
              Detect
            </span>
          </Link>
          <Link
            className="flex flex-col items-center justify-center text-on-surface/60 p-2 hover:text-primary active:scale-90 transition-all duration-300 ease-out"
            href="/app/adivise"
          >
            <Leaf className="h-5 w-5" />
            <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-1">
              Advisory
            </span>
          </Link>
          <Link
            className="flex flex-col items-center justify-center bg-gradient-to-br from-[#486808] to-[#85A947] text-white rounded-full p-4 scale-110 -translate-y-2 shadow-lg active:scale-90 transition-all duration-300 ease-out"
            href="/app/profile"
          >
            <User className="h-5 w-5 fill-current" />
            <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-1">
              Profile
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
