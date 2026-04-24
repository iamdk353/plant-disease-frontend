"use client";
import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "../components/Nav";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import RecentActivity from "../components/RecentActivity";
import { Camera, Home, Leaf, MapPin, User } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useCurrentUser();
  const [userName, setUserName] = useState("Farmer");
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    if (user?.displayName) {
      setUserName(user.displayName.split(" ")[0]);
    }
  }, [user, loading]);
  const router = useRouter();

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body relative">
      <div className="flex pt-20">
        <Nav />

        {/* Main Content Canvas */}
        <main className="flex-1 px-6 md:px-12 py-8 max-w-5xl  mx-auto">
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
                    <Leaf className="h-10 w-10" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                    <Camera className="h-5 w-5" />
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
                      <Leaf className="h-10 w-10" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                      <MapPin className="h-5 w-5" />
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
          <RecentActivity />
        </main>
      </div>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-6 pb-8 pt-4 bg-surface/90 backdrop-blur-2xl rounded-t-[3rem] z-50 shadow-[0_-10px_40px_rgba(24,29,25,0.06)]">
        <a
          className="flex flex-col items-center justify-center bg-gradient-to-br from-[#486808] to-[#85A947] text-white rounded-full p-4 scale-110 -translate-y-2 shadow-lg transition-all duration-300 ease-out"
          href="#"
        >
          <Home className="h-5 w-5 fill-current" />
        </a>
        <button
          onClick={() => router.push("/app/diagnoise")}
          className="flex flex-col items-center justify-center text-on-surface/60 p-2 active:scale-90 transition-all"
        >
          <Camera className="h-5 w-5" />
          <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-1">
            Detect
          </span>
        </button>
        <Link
          className="flex flex-col items-center justify-center text-on-surface/60 p-2 active:scale-90 transition-all"
          href="/app/adivise"
        >
          <Leaf className="h-5 w-5" />
          <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-1">
            Advisory feew
          </span>
        </Link>
        <a
          className="flex flex-col items-center justify-center text-on-surface/60 p-2 active:scale-90 transition-all"
          href="#"
        >
          <User className="h-5 w-5" />
          <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-1">
            Profile
          </span>
        </a>
      </nav>
    </div>
  );
}
