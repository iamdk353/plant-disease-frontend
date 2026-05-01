"use client";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Nav from "@/app/components/Nav";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getApiBaseUrl } from "@/lib/api";
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
const PROFILE_STORAGE_KEY_PREFIX = "agrinex-profile";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "kn", label: "Kannada" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "ml", label: "Malayalam" },
  { value: "hi", label: "Hindi" },
] as const;

type SupportedLanguage = (typeof LANGUAGE_OPTIONS)[number]["value"];

type UserProfile = {
  id: string;
  firebase_uid: string;
  email: string | null;
  name: string | null;
  photo_object_name: string | null;
  photo_url: string | null;
  phone_number: string | null;
  years_of_experience: number | null;
  acres: number | null;
  primary_crops: string[] | null;
  soil_type: string | null;
};

type RawUserProfile = Omit<
  UserProfile,
  "years_of_experience" | "acres" | "primary_crops"
> & {
  years_of_experience: number | string | null;
  acres: number | string | null;
  primary_crops: string[] | string | null;
};

const SUPPORTED_LANGUAGE_SET = new Set<SupportedLanguage>(
  LANGUAGE_OPTIONS.map(({ value }) => value),
);

const INCLUDED_LANGUAGE_CODES = LANGUAGE_OPTIONS.filter(
  ({ value }) => value !== "en",
)
  .map(({ value }) => value)
  .join(",");

const API_BASE = getApiBaseUrl();
const PROFILE_UPDATED_EVENT = "profile-updated";

const notifyProfileUpdated = (profile: UserProfile) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<UserProfile>(PROFILE_UPDATED_EVENT, { detail: profile }),
    );
  }
};

const getProfileStorageKey = (uid: string) =>
  `${PROFILE_STORAGE_KEY_PREFIX}:${uid}`;

const readCachedProfile = (uid: string): UserProfile | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawProfile = window.localStorage.getItem(getProfileStorageKey(uid));
    if (!rawProfile) {
      return null;
    }

    return JSON.parse(rawProfile) as UserProfile;
  } catch (error) {
    console.error("Failed to read cached profile:", error);
    return null;
  }
};

const writeCachedProfile = (uid: string, profile: UserProfile) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      getProfileStorageKey(uid),
      JSON.stringify(profile),
    );
  } catch (error) {
    console.error("Failed to cache profile:", error);
  }
};

const parseNullableNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isNaN(value) ? null : value;
  }

  const parsedValue = Number.parseFloat(value);
  return Number.isNaN(parsedValue) ? null : parsedValue;
};

const parsePrimaryCrops = (
  value: string[] | string | null | undefined,
): string[] | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map((crop) => crop.trim()).filter(Boolean);
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(trimmedValue) as unknown;
    if (Array.isArray(parsedValue)) {
      return parsedValue
        .map((crop) => (typeof crop === "string" ? crop.trim() : ""))
        .filter(Boolean);
    }
  } catch {
    // Fall back to comma-separated parsing below.
  }

  return trimmedValue
    .split(",")
    .map((crop) => crop.trim().replace(/^"+|"+$/g, ""))
    .filter(Boolean);
};

const normalizeProfile = (rawProfile: RawUserProfile): UserProfile => ({
  ...rawProfile,
  years_of_experience: parseNullableNumber(rawProfile.years_of_experience),
  acres: parseNullableNumber(rawProfile.acres),
  primary_crops: parsePrimaryCrops(rawProfile.primary_crops),
});

const mergeProfiles = (
  baseProfile: UserProfile | null,
  incomingProfile: UserProfile,
): UserProfile => ({
  ...baseProfile,
  ...incomingProfile,
  phone_number:
    incomingProfile.phone_number ?? baseProfile?.phone_number ?? null,
  years_of_experience:
    incomingProfile.years_of_experience ??
    baseProfile?.years_of_experience ??
    null,
  acres: incomingProfile.acres ?? baseProfile?.acres ?? null,
  primary_crops:
    incomingProfile.primary_crops ?? baseProfile?.primary_crops ?? null,
  soil_type: incomingProfile.soil_type ?? baseProfile?.soil_type ?? null,
  photo_object_name:
    incomingProfile.photo_object_name ?? baseProfile?.photo_object_name ?? null,
  photo_url: incomingProfile.photo_url ?? baseProfile?.photo_url ?? null,
});

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const readErrorMessage = async (response: Response) => {
  const text = await response.text();
  return (
    text.trim() ||
    response.statusText ||
    `Request failed with ${response.status}`
  );
};

const getProfile = async (uid: string): Promise<UserProfile> => {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(uid)}`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });

  if (res.status === 404) {
    throw new ApiError(404, "User not found");
  }

  if (!res.ok) {
    throw new ApiError(res.status, await readErrorMessage(res));
  }

  return normalizeProfile((await res.json()) as RawUserProfile);
};

const createProfile = async ({
  uid,
  name,
  email,
  phoneNumber,
  yearsOfExperience,
  acres,
  primaryCrops,
  soilType,
  photoFile,
}: {
  uid: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  yearsOfExperience?: number;
  acres?: number;
  primaryCrops?: string[];
  soilType?: string;
  photoFile?: File;
}): Promise<UserProfile> => {
  const form = new FormData();
  form.append("uid", uid);

  if (name?.trim()) {
    form.append("name", name.trim());
  }
  if (email?.trim()) {
    form.append("email", email.trim());
  }
  if (phoneNumber?.trim()) {
    form.append("phone_number", phoneNumber.trim());
  }
  if (yearsOfExperience !== undefined) {
    form.append("years_of_experience", yearsOfExperience.toString());
  }
  if (acres !== undefined) {
    form.append("acres", acres.toString());
  }
  if (primaryCrops?.length) {
    form.append("primary_crops", primaryCrops.join(","));
  }
  if (soilType?.trim()) {
    form.append("soil_type", soilType.trim());
  }
  if (photoFile) {
    form.append("photo", photoFile);
  }

  const res = await fetch(`${API_BASE}/users/`, {
    method: "POST",
    body: form,
    headers: { "ngrok-skip-browser-warning": "true" },
  });

  if (res.status === 409) {
    throw new ApiError(409, "User already exists");
  }

  if (!res.ok) {
    throw new ApiError(res.status, await readErrorMessage(res));
  }

  return normalizeProfile((await res.json()) as RawUserProfile);
};

const updateProfile = async (
  uid: string,
  updates: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    yearsOfExperience?: number;
    acres?: number;
    primaryCrops?: string[];
    soilType?: string;
    photoFile?: File;
  },
): Promise<UserProfile> => {
  const form = new FormData();

  if (updates.name !== undefined) {
    form.append("name", updates.name);
  }
  if (updates.email !== undefined) {
    form.append("email", updates.email);
  }
  if (updates.phoneNumber !== undefined) {
    form.append("phone_number", updates.phoneNumber);
  }
  if (updates.yearsOfExperience !== undefined) {
    form.append("years_of_experience", updates.yearsOfExperience.toString());
  }
  if (updates.acres !== undefined) {
    form.append("acres", updates.acres.toString());
  }
  if (updates.primaryCrops !== undefined) {
    form.append("primary_crops", updates.primaryCrops.join(","));
  }
  if (updates.soilType !== undefined) {
    form.append("soil_type", updates.soilType);
  }
  if (updates.photoFile) {
    form.append("photo", updates.photoFile);
  }

  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(uid)}`, {
    method: "PATCH",
    body: form,
    headers: { "ngrok-skip-browser-warning": "true" },
  });

  if (res.status === 409) {
    throw new ApiError(409, "Email already registered");
  }

  if (!res.ok) {
    throw new ApiError(res.status, await readErrorMessage(res));
  }

  return normalizeProfile((await res.json()) as RawUserProfile);
};

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftPhoneNumber, setDraftPhoneNumber] = useState("");
  const [draftYearsExperience, setDraftYearsExperience] = useState("");
  const [draftAcres, setDraftAcres] = useState("");
  const [draftPrimaryCrops, setDraftPrimaryCrops] = useState("");
  const [draftSoilType, setDraftSoilType] = useState("");
  const [draftPhotoFile, setDraftPhotoFile] = useState<File | null>(null);
  const [draftPhotoName, setDraftPhotoName] = useState("");
  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedLanguage>("en");
  const [hasLoadedLanguagePreference, setHasLoadedLanguagePreference] =
    useState(false);
  const [isTranslateReady, setIsTranslateReady] = useState(false);
  const [isApplyingLanguage, setIsApplyingLanguage] = useState(false);
  const [translateError, setTranslateError] = useState("");
  const [location, setLocation] = useState<string>("Locating...");

  const syncDraftFromProfile = (nextProfile: UserProfile) => {
    setDraftName(nextProfile.name ?? "");
    setDraftEmail(nextProfile.email ?? "");
    setDraftPhoneNumber(nextProfile.phone_number ?? "");
    setDraftYearsExperience(nextProfile.years_of_experience?.toString() ?? "");
    setDraftAcres(nextProfile.acres?.toString() ?? "");
    setDraftPrimaryCrops(nextProfile.primary_crops?.join(", ") ?? "");
    setDraftSoilType(nextProfile.soil_type ?? "");
    setDraftPhotoFile(null);
    setDraftPhotoName("");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
    if (loading) {
      return;
    }

    if (!user) {
      setProfile(null);
      setProfileError("");
      setProfileMessage("");
      setIsEditingProfile(false);
      return;
    }

    let isCancelled = false;

    const loadProfile = async () => {
      setProfileLoading(true);
      setProfileError("");
      setProfileMessage("");

      const cachedProfile = readCachedProfile(user.uid);
      if (cachedProfile && !isCancelled) {
        setProfile(cachedProfile);
        syncDraftFromProfile(cachedProfile);
      }

      try {
        const currentProfile = mergeProfiles(
          cachedProfile,
          await getProfile(user.uid),
        );
        if (isCancelled) {
          return;
        }

        setProfile(currentProfile);
        writeCachedProfile(user.uid, currentProfile);
        notifyProfileUpdated(currentProfile);
        syncDraftFromProfile(currentProfile);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        if (error instanceof ApiError && error.status === 404) {
          try {
            const createdProfile = await createProfile({
              uid: user.uid,
              name: user.displayName ?? undefined,
              email: user.email ?? undefined,
            });
            const mergedCreatedProfile = mergeProfiles(
              cachedProfile,
              createdProfile,
            );

            if (isCancelled) {
              return;
            }

            setProfile(mergedCreatedProfile);
            writeCachedProfile(user.uid, mergedCreatedProfile);
            notifyProfileUpdated(mergedCreatedProfile);
            syncDraftFromProfile(mergedCreatedProfile);
          } catch (createError) {
            if (isCancelled) {
              return;
            }

            if (createError instanceof ApiError && createError.status === 409) {
              try {
                const existingProfile = mergeProfiles(
                  cachedProfile,
                  await getProfile(user.uid),
                );
                if (isCancelled) {
                  return;
                }

                setProfile(existingProfile);
                writeCachedProfile(user.uid, existingProfile);
                notifyProfileUpdated(existingProfile);
                syncDraftFromProfile(existingProfile);
                return;
              } catch (refetchError) {
                setProfileError(
                  refetchError instanceof Error
                    ? refetchError.message
                    : "Unable to load profile.",
                );
                return;
              }
            }

            setProfileError(
              createError instanceof Error
                ? createError.message
                : "Unable to create your profile.",
            );
          }
        } else {
          setProfileError(
            error instanceof Error ? error.message : "Unable to load profile.",
          );
        }
      } finally {
        if (!isCancelled) {
          setProfileLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [loading, user]);

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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/weather?lat=${lat}&lon=${lon}`,
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

  const handleProfileEdit = () => {
    if (!profile) {
      return;
    }

    syncDraftFromProfile(profile);
    setProfileError("");
    setProfileMessage("");
    setIsEditingProfile(true);
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setDraftPhotoFile(file);
    setDraftPhotoName(file?.name ?? "");
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    const normalizedName = draftName.trim();
    const normalizedEmail = draftEmail.trim();
    const normalizedPhoneNumber = draftPhoneNumber.trim();
    const normalizedYears = draftYearsExperience.trim();
    const normalizedAcres = draftAcres.trim();
    const normalizedSoilType = draftSoilType.trim();
    const normalizedPrimaryCrops = draftPrimaryCrops
      .split(",")
      .map((crop) => crop.trim())
      .filter(Boolean);
    const parsedYears = normalizedYears
      ? Number.parseInt(normalizedYears, 10)
      : undefined;
    const parsedAcres = normalizedAcres
      ? Number.parseFloat(normalizedAcres)
      : undefined;
    const yearsValue = Number.isNaN(parsedYears) ? undefined : parsedYears;
    const acresValue = Number.isNaN(parsedAcres) ? undefined : parsedAcres;

    const updates: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      yearsOfExperience?: number;
      acres?: number;
      primaryCrops?: string[];
      soilType?: string;
      photoFile?: File;
    } = {};

    if (profile && normalizedName !== (profile.name ?? "")) {
      updates.name = normalizedName;
    }
    if (profile && normalizedEmail !== (profile.email ?? "")) {
      updates.email = normalizedEmail;
    }
    if (profile && normalizedPhoneNumber !== (profile.phone_number ?? "")) {
      updates.phoneNumber = normalizedPhoneNumber;
    }
    if (
      profile &&
      yearsValue !== undefined &&
      yearsValue !== (profile.years_of_experience ?? null)
    ) {
      updates.yearsOfExperience = yearsValue;
    }
    if (
      profile &&
      acresValue !== undefined &&
      acresValue !== (profile.acres ?? null)
    ) {
      updates.acres = acresValue;
    }
    if (profile) {
      const currentPrimaryCrops = profile.primary_crops ?? [];
      if (normalizedPrimaryCrops.join(",") !== currentPrimaryCrops.join(",")) {
        updates.primaryCrops = normalizedPrimaryCrops;
      }
    }
    if (profile && normalizedSoilType !== (profile.soil_type ?? "")) {
      updates.soilType = normalizedSoilType;
    }
    if (draftPhotoFile) {
      updates.photoFile = draftPhotoFile;
    }

    const hasChanges =
      updates.name !== undefined ||
      updates.email !== undefined ||
      updates.phoneNumber !== undefined ||
      updates.yearsOfExperience !== undefined ||
      updates.acres !== undefined ||
      updates.primaryCrops !== undefined ||
      updates.soilType !== undefined ||
      updates.photoFile !== undefined;

    if (!hasChanges) {
      setProfileMessage("No changes to save.");
      return;
    }

    setProfileSaving(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const serverProfile = await updateProfile(user.uid, updates);
      const optimisticProfile = mergeProfiles(profile, {
        ...serverProfile,
        name: updates.name ?? serverProfile.name ?? profile?.name ?? null,
        email: updates.email ?? serverProfile.email ?? profile?.email ?? null,
        phone_number:
          updates.phoneNumber ??
          serverProfile.phone_number ??
          profile?.phone_number ??
          null,
        years_of_experience:
          updates.yearsOfExperience ??
          serverProfile.years_of_experience ??
          profile?.years_of_experience ??
          null,
        acres: updates.acres ?? serverProfile.acres ?? profile?.acres ?? null,
        primary_crops:
          updates.primaryCrops ??
          serverProfile.primary_crops ??
          profile?.primary_crops ??
          null,
        soil_type:
          updates.soilType ??
          serverProfile.soil_type ??
          profile?.soil_type ??
          null,
      });

      setProfile(optimisticProfile);
      writeCachedProfile(user.uid, optimisticProfile);
      notifyProfileUpdated(optimisticProfile);
      syncDraftFromProfile(optimisticProfile);
      setIsEditingProfile(false);
      setProfileMessage("Profile updated.");
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Unable to update profile.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!profile) {
      return;
    }

    syncDraftFromProfile(profile);
    setProfileError("");
    setProfileMessage("");
    setIsEditingProfile(false);
  };

  const profileImageSrc =
    profile?.photo_url || user?.photoURL || "https://placehold.co/256x256/png";
  const displayName = profile?.name || user?.displayName || "Farmer";
  const displayEmail = profile?.email || user?.email || "No email linked";
  const displayPhoneNumber = profile?.phone_number || "No phone number linked";
  const displayYearsExperience =
    profile?.years_of_experience !== null &&
    profile?.years_of_experience !== undefined
      ? `${profile.years_of_experience} Years Exp.`
      : "Experience not set";
  const displayAcres =
    profile?.acres !== null && profile?.acres !== undefined
      ? profile.acres
      : null;
  const displayPrimaryCrops =
    profile?.primary_crops && profile.primary_crops.length
      ? profile.primary_crops
      : null;
  const displaySoilType = profile?.soil_type || "Not set";

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
                alt="Profile picture"
                className="w-full h-full object-cover"
                src={profileImageSrc}
              />
            </div>
            <div className="flex-1 pb-4">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
                  {displayName}
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
                  <Calendar className="h-[18px] w-[18px]" />{" "}
                  {displayYearsExperience}
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 pb-4 md:w-[420px] lg:w-[500px]">
              <div className="flex flex-wrap gap-3">
                <button
                  className="bg-gradient-to-br from-[#486808] to-[#85a947] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95 transition-transform"
                  onClick={handleProfileEdit}
                  disabled={!profile || profileLoading || profileSaving}
                  type="button"
                >
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
              </div>
            </div>
          </div>
          {profileError ? (
            <p className="mt-6 text-sm font-medium text-error">
              {profileError}
            </p>
          ) : null}
          {profileMessage ? (
            <p className="mt-6 text-sm font-medium text-primary">
              {profileMessage}
            </p>
          ) : null}
          {profileLoading ? (
            <p className="mt-6 text-xs font-medium text-on-surface-variant">
              Loading profile...
            </p>
          ) : null}
          {isEditingProfile ? (
            <form
              className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-outline-variant/30 bg-surface/90 p-4 shadow-sm backdrop-blur-sm md:grid-cols-2 xl:grid-cols-3"
              onSubmit={handleProfileSubmit}
            >
              <div className="grid gap-2">
                <label
                  className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant"
                  htmlFor="profile-name"
                >
                  Name
                </label>
                <input
                  id="profile-name"
                  className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label
                  className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant"
                  htmlFor="profile-email"
                >
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  value={draftEmail}
                  onChange={(event) => setDraftEmail(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label
                  className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant"
                  htmlFor="profile-phone"
                >
                  Phone Number
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  value={draftPhoneNumber}
                  onChange={(event) => setDraftPhoneNumber(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label
                  className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant"
                  htmlFor="profile-years"
                >
                  Years of Experience
                </label>
                <input
                  id="profile-years"
                  type="number"
                  min="0"
                  className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  value={draftYearsExperience}
                  onChange={(event) =>
                    setDraftYearsExperience(event.target.value)
                  }
                />
              </div>
              <div className="grid gap-2">
                <label
                  className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant"
                  htmlFor="profile-acres"
                >
                  Acres
                </label>
                <input
                  id="profile-acres"
                  type="number"
                  min="0"
                  step="0.1"
                  className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  value={draftAcres}
                  onChange={(event) => setDraftAcres(event.target.value)}
                />
              </div>
              <div className="grid gap-2 md:col-span-2 xl:col-span-3">
                <label
                  className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant"
                  htmlFor="profile-primary-crops"
                >
                  Primary Crops
                </label>
                <input
                  id="profile-primary-crops"
                  type="text"
                  placeholder="Rice, Wheat, Corn"
                  className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  value={draftPrimaryCrops}
                  onChange={(event) => setDraftPrimaryCrops(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label
                  className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant"
                  htmlFor="profile-soil-type"
                >
                  Soil Type
                </label>
                <input
                  id="profile-soil-type"
                  type="text"
                  className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  value={draftSoilType}
                  onChange={(event) => setDraftSoilType(event.target.value)}
                />
              </div>
              <div className="grid gap-2 md:col-span-2 xl:col-span-3">
                <label
                  className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant"
                  htmlFor="profile-photo"
                >
                  Photo
                </label>
                <input
                  id="profile-photo"
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-on-surface file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  onChange={handlePhotoChange}
                />
                <p className="text-xs text-on-surface-variant">
                  {draftPhotoName ||
                    profile?.photo_object_name ||
                    "No new photo selected"}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 md:col-span-2 xl:col-span-3">
                <button
                  className="rounded-full bg-primary px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={profileSaving}
                  type="submit"
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  className="rounded-full border border-outline-variant/30 bg-surface-container-high px-6 py-3 font-bold text-on-surface-variant"
                  disabled={profileSaving}
                  type="button"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
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
                  Total acres
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black font-headline text-primary">
                    {displayAcres ?? "--"}
                  </span>
                  <span className="text-on-surface font-semibold">Acres</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">
                  Primary crops
                </p>
                <div className="flex flex-wrap gap-2">
                  {displayPrimaryCrops ? (
                    displayPrimaryCrops.map((crop) => (
                      <span
                        key={crop}
                        className="bg-surface-container text-on-surface px-3 py-1 rounded-lg font-medium border border-outline-variant/10"
                      >
                        {crop}
                      </span>
                    ))
                  ) : (
                    <span className="text-on-surface-variant text-sm">
                      Not set
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">
                  Soil type
                </p>
                <div className="flex items-center gap-2">
                  <Mountain className="h-5 w-5 text-tertiary" />
                  <span className="text-xl font-bold text-on-surface">
                    {displaySoilType}
                  </span>
                </div>
              </div>
            </div>
            <div className="my-8 rounded-xl  bg-yellow-50 p-4 text-sm text-yellow-900">
              <div className="flex items-start gap-3">
                <span className="text-lg"></span>
                <div>
                  <p className="font-semibold">Early Stage Application</p>
                  <p className="mt-1 text-xs leading-relaxed">
                    This system is currently in its initial development phase.
                    It does not yet support all crop types and may have limited
                    accuracy in certain scenarios.
                    <br />
                    We are continuously improving the model by expanding crop
                    coverage, refining predictions, and incorporating more
                    real-world data.
                  </p>
                </div>
              </div>
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
                <p className="font-headline font-bold">{displayPhoneNumber}</p>
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
                <p className="font-headline font-bold">{displayEmail}</p>
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
