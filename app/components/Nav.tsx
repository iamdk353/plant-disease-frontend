"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getApiBaseUrl } from "@/lib/api";
import { Leaf } from "lucide-react";

type UserProfile = {
  photo_url: string | null;
};

const API_BASE = getApiBaseUrl();
const PROFILE_UPDATED_EVENT = "profile-updated";

const Nav = () => {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  const navLinks = [
    { href: "/app", label: "Dashboard" },
    { href: "/app/diagnoise", label: "Diagnose" },
    { href: "/app/adivise", label: "Advise" },
    { href: "/app/profile", label: "Profile" },
  ];

  useEffect(() => {
    if (!user?.uid) {
      setProfilePhotoUrl(null);
      return;
    }

    let isCancelled = false;

    const loadProfilePhoto = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/users/${encodeURIComponent(user.uid)}`,
          {
            headers: { "ngrok-skip-browser-warning": "true" },
          },
        );

        if (!res.ok) {
          if (res.status !== 404) {
            console.error("Failed to load profile photo:", res.status);
          }
          if (!isCancelled) {
            setProfilePhotoUrl(null);
          }
          return;
        }

        const profile = (await res.json()) as UserProfile;
        if (!isCancelled) {
          setProfilePhotoUrl(profile.photo_url ?? null);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to load profile photo:", error);
          setProfilePhotoUrl(null);
        }
      }
    };

    void loadProfilePhoto();

    return () => {
      isCancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    const handleProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<UserProfile>).detail;
      if (detail?.photo_url !== undefined) {
        setProfilePhotoUrl(detail.photo_url);
      }
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    };
  }, []);

  const avatarSrc =
    profilePhotoUrl ||
    user?.photoURL ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAmpoiOZqcAQ_P3iOTpDrGnx5hhdsKM2oFwKmRj4ahKH7KXcvclWH8HVBEJx9K0jce8tZIAPY8rNn-0QqvT5gT09QrIbry_E2VHp-FLw79UQtaSBFCpFGssjUdsLgWjtDHUxFuVRaMeY7aU8KkABTY9kYWWBrlAtcPXyyQV8txzzUCUN-Aasq218pspk_ef4ruoX_Pzhdqhn1od1EFBRsl1hprYZKi7V1CGcW05LAy8mIK-uSBRUKWGHS40liOH_KpELIs1Voh3T4ZH";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-sm shadow-[#181d19]/5 flex justify-between items-center px-6 py-4">
      <Link href="/app" className="flex items-center gap-2">
        <Leaf className="w-8 h-8 text-primary" />
        <span className="text-2xl font-bold text-primary font-headline tracking-tight">
          AgriNex AI
        </span>
      </Link>

      <div className="hidden md:flex gap-8 items-center">
        {navLinks.map((link) => {
          // Exact match for the dashboard index route, otherwise startsWith for nested routes
          const isActive =
            link.href === "/app"
              ? pathname === "/app"
              : pathname?.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`font-headline transition-colors relative ${
                isActive
                  ? "text-primary font-bold"
                  : "text-on-surface-variant font-medium hover:text-primary"
              }`}
            >
              {link.label}
              {/* Subtle underline indicator for the active route */}
              {isActive && (
                <span className="absolute -bottom-1.5 left-0 w-full h-[2.5px] bg-primary rounded-t-sm" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <Link href="/app/profile">
          <img
            alt="Profile picture"
            className={`w-10 h-10 rounded-full object-cover border-2 transition-colors ${
              pathname?.startsWith("/app/profile")
                ? "border-primary shadow-sm"
                : "border-primary-container hover:border-primary"
            }`}
            src={avatarSrc}
          />
        </Link>
      </div>
    </nav>
  );
};

export default Nav;
