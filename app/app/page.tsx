"use client";
import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const [userName, setUserName] = useState("Farmer");
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.displayName) {
        setUserName(user.displayName.split(" ")[0]); // Grab first name
      }
    });

    return () => unsubscribe();
  }, []);
  const router = useRouter();

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body relative">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div className="text-2xl font-extrabold text-primary font-headline tracking-tighter">
            AgriAI
          </div>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary cursor-pointer active:scale-95 transition-transform duration-200">
              account_circle
            </span>
          </div>
        </div>
      </nav>

      <div className="flex pt-20">
        {/* SideNavBar (Hidden on mobile) */}
        <aside className="hidden md:flex flex-col h-[calc(100vh-5rem)] py-8 gap-2 w-72 bg-surface rounded-r-[3rem] sticky top-20 shadow-[30px_0_60px_-5px_rgba(24,29,25,0.04)]">
          <div className="px-8 mb-8">
            <div className="text-xl font-black text-primary font-headline">
              AgriAI
            </div>
            <div className="text-sm font-semibold opacity-60">
              Precision Greenhouse
            </div>
          </div>
          <a
            className="bg-primary text-on-primary rounded-full mx-4 py-4 px-6 flex items-center gap-3 active:scale-[0.98] transition-all font-semibold"
            href="#"
          >
            <span className="material-symbols-outlined">home</span>
            <span>Home</span>
          </a>
          <Link
            className="text-on-surface mx-4 py-4 px-6 flex items-center gap-3 hover:bg-surface-container-low rounded-full active:scale-[0.98] transition-all font-semibold"
            href="/app/diagnoise"
          >
            <span className="material-symbols-outlined">
              center_focus_strong
            </span>
            <span>Diagnosis</span>
          </Link>
          <Link
            className="text-on-surface mx-4 py-4 px-6 flex items-center gap-3 hover:bg-surface-container-low rounded-full active:scale-[0.98] transition-all font-semibold"
            href="/app/adivise"
          >
            <span className="material-symbols-outlined">psychology</span>
            <span>Advisory</span>
          </Link>
          <a
            className="text-on-surface mx-4 py-4 px-6 flex items-center gap-3 hover:bg-surface-container-low rounded-full active:scale-[0.98] transition-all font-semibold"
            href="#"
          >
            <span className="material-symbols-outlined">history</span>
            <span>History</span>
          </a>
          <div className="mt-auto px-4">
            <button className="w-full py-4 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform">
              Get Support
            </button>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-1 px-6 md:px-12 py-8 max-w-5xl">
          {/* Header Section */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline text-on-surface mb-2">
              {greeting}, {userName}!
            </h1>
            <p className="text-lg text-on-surface-variant/80 font-medium max-w-xl">
              Happy Harvesting..!
            </p>
          </header>

          {/* Primary CTAs: Large Rounded Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Diagnose My Crop Card */}
            <div
              onClick={() => router.push("/app/diagnoise")}
              className="group relative overflow-hidden bg-surface-container-lowest p-8 rounded-xl shadow-[30px_0_60px_-5px_rgba(24,29,25,0.04)] cursor-pointer active:scale-[0.98] transition-all border-none"
            >
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary-container/10 rounded-full blur-3xl group-hover:bg-primary-container/20 transition-colors"></div>
              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary-container/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-4xl">
                      eco
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined">
                      photo_camera
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-headline text-on-surface mb-1">
                    Diagnose My Crop
                  </h3>
                  <p className="text-on-surface-variant text-sm">
                    Scan leaf issues with AI vision
                  </p>
                </div>
              </div>
            </div>

            {/* What Should I Plant? Card */}
            <Link href="/app/adivise">
              <div className="group relative overflow-hidden bg-surface-container-lowest p-8 rounded-xl shadow-[30px_0_60px_-5px_rgba(24,29,25,0.04)] cursor-pointer active:scale-[0.98] transition-all border-none">
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-tertiary-container/10 rounded-full blur-3xl group-hover:bg-tertiary-container/20 transition-colors"></div>
                <div className="flex flex-col gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-secondary-container/30 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-4xl">
                        potted_plant
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined">
                        location_on
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-headline text-on-surface mb-1">
                      What Should I Plant?
                    </h3>
                    <p className="text-on-surface-variant text-sm">
                      Analyze soil and local climate
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </section>

          {/* Recent Activity Section */}
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-xl font-bold tracking-tight font-headline">
                Recent Activity
              </h2>
              <button className="text-sm font-bold text-primary hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {/* Activity Item 1 */}
              <div className="flex items-center gap-6 p-4 bg-surface-container-low rounded-lg group hover:bg-surface-container-high transition-colors cursor-pointer">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    alt="macro close-up of a green leaf with small yellow spots and veins visible under natural sunlight"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuByqQTqKasxHg_SND9dGu7TckC0j99WjavTrygJOyjDFiL8kpdlXmOTt1F_xLqdDVobGJUrPuBUn-qPnaN7B_iF7QvnSG8egTOriDc0Ij9MYAbxb99IbZKNVS93TNnhlpLrin8hDJoOBuM3KFyAgWR3Mi7i3I3rlHCH8TjCPeVTL_Lngpouc_uOrAxnbMXgdfEXzyuVjusKe-08hP626E7PtMAM-pkvoIZQQsVgDNQNW0DGzXd7GIj1DDiTCBxWVtvXYXj8R8YmpR9_"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold uppercase tracking-wider">
                      Warning
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      May 12, 09:45 AM
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-on-surface">
                    Tomato Early Blight
                  </h4>
                  <p className="text-sm text-on-surface-variant">
                    Fungal infection detected in Sector A
                  </p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant opacity-40 group-hover:opacity-100 transition-opacity">
                  chevron_right
                </span>
              </div>

              {/* Activity Item 2 */}
              <div className="flex items-center gap-6 p-4 bg-surface-container-low rounded-lg group hover:bg-surface-container-high transition-colors cursor-pointer">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    alt="fresh green potato plant growing in rich dark soil inside a sunlit commercial greenhouse"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCba3YNW70jgyRrrBiprHgaLyICIy01hDe4SdvBe0ZytU1XSu1OsiunA3vbm3Y9Gs6u6rWdQPntF7-Hy9yieD6l9XoH8vh8KiCIQ1j81iYSkLviYzJ2DzY6GOK4_wuQ8cFFJUOVHv_klb4KfRyx0uZO1eCYVTRDG64_22FKy3B5MUImrbuKZuAL6-MJWtL0Vc0p0UbCx2-kOXp5HBTBa_T9VsLKNSFoNUPf4Px1LEx7I-vvpX-RTANkihad45KKKqv087o0Bym4ZYyH"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">
                      Healthy
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      May 10, 04:20 PM
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-on-surface">
                    Potato Foliage
                  </h4>
                  <p className="text-sm text-on-surface-variant">
                    Optimal nutrient levels detected
                  </p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant opacity-40 group-hover:opacity-100 transition-opacity">
                  chevron_right
                </span>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-6 pb-8 pt-4 bg-surface/90 backdrop-blur-2xl rounded-t-[3rem] z-50 shadow-[0_-10px_40px_rgba(24,29,25,0.06)]">
        <a
          className="flex flex-col items-center justify-center bg-gradient-to-br from-[#486808] to-[#85A947] text-white rounded-full p-4 scale-110 -translate-y-2 shadow-lg transition-all duration-300 ease-out"
          href="#"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            home
          </span>
        </a>
        <button
          onClick={() => router.push("/app/diagnoise")}
          className="flex flex-col items-center justify-center text-on-surface/60 p-2 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined">camera_alt</span>
          <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-1">
            Detect
          </span>
        </button>
        <Link
          className="flex flex-col items-center justify-center text-on-surface/60 p-2 active:scale-90 transition-all"
          href="/app/adivise"
        >
          <span className="material-symbols-outlined">grass</span>
          <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-1">
            Advisory feew
          </span>
        </Link>
        <a
          className="flex flex-col items-center justify-center text-on-surface/60 p-2 active:scale-90 transition-all"
          href="#"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-1">
            Profile
          </span>
        </a>
      </nav>
    </div>
  );
}
