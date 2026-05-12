"use client";

import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/profile";
import { setStoreUser } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// Paths that DON'T require a complete signed-in state.
// /login → no account needed at all.
// /onboarding → signed in but profile not yet complete.
const AUTH_FREE = new Set(["/login"]);
const ONBOARDING_PATH = "/onboarding";

/**
 * Wraps the whole app. On every render decides whether the current route is
 * allowed given the current auth + profile state, and redirects if not.
 *
 * Renders nothing until auth + profile have been hydrated from localStorage
 * to avoid a flash of the "wrong" page on first paint.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const profile = useProfile();
  const router = useRouter();
  const pathname = usePathname();

  // Initialise auth on first mount.
  useEffect(() => {
    if (!auth.initialized) auth.init();
  }, [auth]);

  // Whenever the active user changes (login or sign-out), rehydrate the
  // profile and re-point the data store at that user's namespace.
  useEffect(() => {
    if (!auth.initialized) return;
    if (auth.userId) {
      profile.load(auth.userId);
      setStoreUser(auth.userId);
    } else {
      profile.clear();
      setStoreUser(null);
    }
    // We deliberately don't depend on `profile` here — it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.initialized, auth.userId]);

  // Routing decisions.
  useEffect(() => {
    if (!auth.initialized) return;
    const onAuthFree = AUTH_FREE.has(pathname);
    const onOnboarding = pathname === ONBOARDING_PATH;

    if (!auth.userId) {
      if (!onAuthFree) router.replace("/login");
      return;
    }

    // Signed in. If onboarding hasn't been completed, force them through it.
    const complete = profile.profile?.onboardingComplete;
    if (!complete) {
      if (!onOnboarding) router.replace(ONBOARDING_PATH);
      return;
    }

    // Signed in and complete — bounce away from auth-only screens.
    if (onAuthFree || onOnboarding) router.replace("/");
  }, [
    auth.initialized,
    auth.userId,
    profile.profile?.onboardingComplete,
    pathname,
    router,
  ]);

  if (!auth.initialized) return null;
  return <>{children}</>;
}
