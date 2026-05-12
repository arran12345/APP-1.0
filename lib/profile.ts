"use client";

import { create } from "zustand";

// Profiles live in localStorage keyed by user id. The active profile lives
// in zustand state so components can subscribe to changes; persistence is
// manual via load() / save() — we don't use the persist middleware here
// because the active user changes over time.

export type Gender = "male" | "female" | "other" | "prefer-not-to-say";

export interface Profile {
  userId: string;
  gender?: Gender;
  height?: number;       // centimetres
  weight?: number;       // user's preferred weight unit (kg or lb)
  photoDataUrl?: string; // base64 data URL — resized to ~256px square before save
  onboardingComplete: boolean;
}

const PROFILES_KEY = "pulse:profiles";

function readAll(): Record<string, Profile> {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, Profile>): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(map));
}

interface ProfileState {
  profile: Profile | null;
  load: (userId: string) => void;
  save: (patch: Partial<Omit<Profile, "userId">>) => void;
  clear: () => void;
}

export const useProfile = create<ProfileState>((set, get) => ({
  profile: null,
  load(userId) {
    const map = readAll();
    set({
      profile: map[userId] ?? { userId, onboardingComplete: false },
    });
  },
  save(patch) {
    const current = get().profile;
    if (!current) return;
    const next: Profile = { ...current, ...patch };
    const map = readAll();
    map[next.userId] = next;
    writeAll(map);
    set({ profile: next });
  },
  clear() {
    set({ profile: null });
  },
}));

// Display name used in greetings etc. Pulls the email's local part to keep
// the dashboard friendly without forcing the user to type a name.
export function displayNameFromEmail(email: string | null | undefined): string {
  if (!email) return "there";
  const local = email.split("@")[0] ?? "";
  if (!local) return "there";
  // Title-case the first letter
  return local.charAt(0).toUpperCase() + local.slice(1);
}
