"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Nav from "@/app/components/Nav";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32 font-body overflow-x-hidden">
      <Nav />

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
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBfDGKi_Kn77VTyx7Gqqx7L4GUJ3NjdEvxL5NNMar8cRe1IEsoU_B44GY3sxEwET8k482E0CSXUer2J8Fkzy4hUcG4lJvSsQCPUgVETjCwuJIskjao5DskYmpC4IqxgC3c_-GbhyGH-NEP88DWUPiXCNnOrO9Bgy9tAYcpSqvELxlzraBiuoNRygzpm3-13Z8S8cQ8MtHXLaf_cbUktgNtO7YzUq2UamXqtZF8IapWa03wsvjxy-CR9NZdwMof4AqWQx7WD9N1R3r4"
              />
            </div>
            <div className="flex-1 pb-4">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
                  Samuel Okoro
                </h1>
                <span className="bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Master Farmer
                </span>
              </div>
              <div className="flex items-center gap-4 text-on-surface-variant font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">
                    location_on
                  </span>{" "}
                  Kano, Nigeria
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">
                    calendar_today
                  </span>{" "}
                  15+ Years Exp.
                </span>
              </div>
            </div>
            <div className="flex gap-3 pb-4">
              <button className="bg-gradient-to-br from-[#486808] to-[#85a947] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95 transition-transform">
                <span className="material-symbols-outlined">edit</span> Edit
                Profile
              </button>
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
                  <span className="material-symbols-outlined text-tertiary">
                    landscape
                  </span>
                  <span className="text-xl font-bold text-on-surface">
                    Loamy Clay
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 rounded-lg bg-surface-container-low border-l-4 border-primary">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  psychology
                </span>
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
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
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
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    workspace_premium
                  </span>
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
                  <span className="material-symbols-outlined">water_drop</span>
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
                <span className="material-symbols-outlined">call</span>
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
                <span className="material-symbols-outlined">
                  alternate_email
                </span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Secondary Contact
                </p>
                <p className="font-headline font-bold">samuel.o@agri.ng</p>
              </div>
            </div>
            <div className="bg-primary p-6 rounded-xl shadow-lg flex items-center justify-center gap-3 text-white cursor-pointer hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined">support_agent</span>
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
            <span className="material-symbols-outlined">home</span>
            <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-1">
              Home
            </span>
          </Link>
          <Link
            className="flex flex-col items-center justify-center text-on-surface/60 p-2 hover:text-primary active:scale-90 transition-all duration-300 ease-out"
            href="/app/diagnoise"
          >
            <span className="material-symbols-outlined">camera_alt</span>
            <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-1">
              Detect
            </span>
          </Link>
          <Link
            className="flex flex-col items-center justify-center text-on-surface/60 p-2 hover:text-primary active:scale-90 transition-all duration-300 ease-out"
            href="/app/adivise"
          >
            <span className="material-symbols-outlined">grass</span>
            <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-1">
              Advisory
            </span>
          </Link>
          <Link
            className="flex flex-col items-center justify-center bg-gradient-to-br from-[#486808] to-[#85A947] text-white rounded-full p-4 scale-110 -translate-y-2 shadow-lg active:scale-90 transition-all duration-300 ease-out"
            href="/app/profile"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              person
            </span>
            <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-1">
              Profile
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
