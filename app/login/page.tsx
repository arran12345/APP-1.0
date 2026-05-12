"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/profile";
import { Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const profile = useProfile();

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const result =
        mode === "signup"
          ? await auth.signUp(email, password)
          : await auth.signIn(email, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      // Decide where to go next based on the freshly-saved auth state.
      const uid = useAuth.getState().userId;
      if (!uid) {
        setError("Something went wrong. Try again.");
        return;
      }
      profile.load(uid);
      const loaded = useProfile.getState().profile;
      if (mode === "signup" || !loaded?.onboardingComplete) {
        router.replace("/onboarding");
      } else {
        router.replace("/");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh flex flex-col justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-1.5">
            <Activity className="text-accent" size={20} />
            <h1 className="text-xl font-semibold tracking-tight">Pulse</h1>
          </div>
          <p className="text-sm text-ink-muted">
            {mode === "signin"
              ? "Sign in to your account"
              : "Create your account"}
          </p>
        </div>

        <div className="space-y-3">
          <Input
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <Input
            label="Password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          {error && (
            <p className="text-2xs text-danger leading-tight" role="alert">
              {error}
            </p>
          )}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading || !email.trim() || !password}
            onClick={submit}
          >
            {loading
              ? "..."
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
            className="w-full text-xs text-ink-muted hover:text-ink py-2 transition-colors"
          >
            {mode === "signin"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>

        <p className="text-2xs text-ink-dim text-center mt-10 leading-relaxed">
          Accounts are local to this device. Your data lives here, not in
          the cloud — switching devices won't carry your history over.
        </p>
      </div>
    </main>
  );
}
