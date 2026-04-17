"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";
import Nav from "../../components/Nav";

export default function AdvisoryPage() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

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
                Lagos, Nigeria
              </h1>
              <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">
                edit_location_alt
              </span>
            </div>
          </div>
          <div className="bg-surface-container-high p-3 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">
              calendar_today
            </span>
          </div>
        </header>

        {/* Weather Summary Strip */}
        <section className="bg-surface-container-low rounded-lg p-5 mb-8 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-primary mb-1">
                thermostat
              </span>
              <span className="font-bold text-lg">30°C</span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant/60">
                Temp
              </span>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/30"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-primary mb-1">
                rainy
              </span>
              <span className="font-bold text-lg">20%</span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant/60">
                Rain
              </span>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/30"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-primary mb-1">
                humidity_mid
              </span>
              <span className="font-bold text-lg">75%</span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant/60">
                Humidity
              </span>
            </div>
          </div>
        </section>

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
          <h2 className="text-xl font-bold mb-4 px-1 font-headline">
            Top Recommendations
          </h2>

          {/* Crop Card 1 */}
          <div className="bg-surface-container-lowest rounded-lg p-4 flex gap-4 items-center shadow-[0_10px_40px_rgba(24,29,25,0.04)] active:scale-[0.98] transition-transform">
            <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-lg">
              <img
                className="w-full h-full object-cover"
                alt="Maize"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdndc6NOjEUdNCKHB09s-RS7jhj9h22M6I73fmRNanBGerefQe0fTYMFXEJPg78e-o6Vs8ly94Y645o493iubGsYL1odN3d0KUzOULtqv2qRSEKHuvLUPGLlTHmzPiH1DuS11rJGNNv4rM-JjWUZ1g9N7wg84D0m0YLv7iDjWukWnxgMx-CWV1zQe0u0EirkDFljWLH9jPmkr3onMhC_4WMapaTbPPKPkfpWYpWpLoDZlRcH-_rC8qq5vfOxZ72xSZdR4hnpBfTEOT"
              />
              <div className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">
                #1
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-extrabold text-lg truncate font-headline">
                  Maize
                </h3>
                <div className="bg-secondary-container px-2 py-0.5 rounded-full">
                  <span className="text-[10px] font-black text-on-secondary-container">
                    95% MATCH
                  </span>
                </div>
              </div>
              <p className="text-on-surface-variant text-xs leading-relaxed line-clamp-2">
                Perfect for current soil moisture and rising humidity levels in
                Lagos.
              </p>
            </div>
            <button className="p-2">
              <span className="material-symbols-outlined text-outline">
                chevron_right
              </span>
            </button>
          </div>

          {/* Crop Card 2 */}
          <div className="bg-surface-container-lowest rounded-lg p-4 flex gap-4 items-center shadow-[0_10px_40px_rgba(24,29,25,0.04)] active:scale-[0.98] transition-transform">
            <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-lg">
              <img
                className="w-full h-full object-cover"
                alt="Cassava"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiIZM2NF3Vj8lQqgmcXHoKVU3xErJVkqOUi4KyKfMaTd8e7_eHhs4b-AJSJ0ZMjYbF6aYuaQnrnWCPM76Uxd_7o2RM_OgH8_EL_7XIfZLADBE5ZNk-Wn-PO455M2YTLRR06dim4dRNh3wM5YbKDs8GLjP_7gIegjYBgBc4ghnaMsyRLCXmiEeIv78HKHHjfpVALenfa_Mq0FMNrx2SBfiGwB-775lBLSXJnVwio93Srt75w8FTPzVa75CeQeC0RGa0_4rEcd4pPwte"
              />
              <div className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">
                #2
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-extrabold text-lg truncate font-headline">
                  Cassava
                </h3>
                <div className="bg-secondary-container px-2 py-0.5 rounded-full">
                  <span className="text-[10px] font-black text-on-secondary-container">
                    88% MATCH
                  </span>
                </div>
              </div>
              <p className="text-on-surface-variant text-xs leading-relaxed line-clamp-2">
                Highly resilient to current heat waves and requiring minimal
                irrigation.
              </p>
            </div>
            <button className="p-2">
              <span className="material-symbols-outlined text-outline">
                chevron_right
              </span>
            </button>
          </div>

          {/* Crop Card 3 */}
          <div className="bg-surface-container-lowest rounded-lg p-4 flex gap-4 items-center shadow-[0_10px_40px_rgba(24,29,25,0.04)] active:scale-[0.98] transition-transform opacity-90">
            <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-lg">
              <img
                className="w-full h-full object-cover"
                alt="Yam"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-915un2jgz8smpqRDLcze4HB875sj3d_6thO8zYBoo7LfDypTW3vlGl3tr7j6bqRPLb1ykZFl_nFTNXF-6YgKV51uyyjvG2B90pKz_uKeXlgndLJeXgN2rD3x3IdeJ4N9IPrwWfxsiMwYuFXnS_K5my_N0bAVNNPuxx4bRh15pH7VBtPDnZ9O0_xH35pR6zfHNzXUn4TKoGzwMsXP0AvazrnbhTKalkAkeCHT0HMs5I5wPLj0aJC0x1lNTQUzg8FYWFlxlgW3rRpc"
              />
              <div className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">
                #3
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-extrabold text-lg truncate font-headline">
                  Yam
                </h3>
                <div className="bg-secondary-container px-2 py-0.5 rounded-full">
                  <span className="text-[10px] font-black text-on-secondary-container">
                    82% MATCH
                  </span>
                </div>
              </div>
              <p className="text-on-surface-variant text-xs leading-relaxed line-clamp-2">
                Good potential if planting starts before the next rain cycle
                peaks.
              </p>
            </div>
            <button className="p-2">
              <span className="material-symbols-outlined text-outline">
                chevron_right
              </span>
            </button>
          </div>
        </section>

        {/* CTA / Advisory Insight */}
        <section className="mt-10 p-6 bg-gradient-to-br from-[#486808] to-[#85a947] rounded-lg text-white">
          <div className="flex items-start gap-4">
            <span
              className="material-symbols-outlined text-3xl opacity-80"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              psychology
            </span>
            <div>
              <h4 className="font-bold text-lg mb-1 font-headline">
                AI Recommendation
              </h4>
              <p className="text-white/80 text-sm leading-relaxed">
                Based on satellite imagery, your soil Nitrogen levels are
                slightly low. Consider organic mulching for Maize cultivation
                this week.
              </p>
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
