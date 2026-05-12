"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";
import { fileToSquareDataUrl } from "@/lib/photo";
import { useProfile, type Gender } from "@/lib/profile";
import { useStore } from "@/lib/store";
import { Camera, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export default function OnboardingPage() {
  const auth = useAuth();
  const profile = useProfile();
  const router = useRouter();
  const unit = useStore((s) => s.settings.unit);

  const [gender, setGender] = useState<Gender | "">("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Load any existing profile so editing this page later pre-fills fields.
  useEffect(() => {
    if (!auth.userId) return;
    if (!profile.profile || profile.profile.userId !== auth.userId) {
      profile.load(auth.userId);
    }
  }, [auth.userId, profile]);

  useEffect(() => {
    const p = profile.profile;
    if (!p) return;
    if (p.gender) setGender(p.gender);
    if (p.height != null) setHeight(String(p.height));
    if (p.weight != null) setWeight(String(p.weight));
    if (p.photoDataUrl) setPhoto(p.photoDataUrl);
  }, [profile.profile]);

  async function onPhotoPicked(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await fileToSquareDataUrl(file, 256, 0.7);
      setPhoto(dataUrl);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Couldn't read that image.",
      );
    }
  }

  function save(complete: boolean) {
    setSaving(true);
    profile.save({
      gender: gender || undefined,
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      photoDataUrl: photo,
      onboardingComplete: complete,
    });
    router.replace("/");
  }

  return (
    <main className="min-h-dvh py-10 px-4">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Set up your profile
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Just a few quick details. You can change these any time.
          </p>
        </div>

        {/* Photo */}
        <div>
          <label className="block text-2xs uppercase tracking-widest text-ink-dim mb-2">
            Profile photo (optional)
          </label>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPhotoPicked(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex items-center gap-4 group"
          >
            <div className="h-20 w-20 rounded-full bg-bg-elev border border-line overflow-hidden flex items-center justify-center group-hover:bg-bg-hover transition-colors">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={28} className="text-ink-dim" />
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-accent">
              <Camera size={13} />
              {photo ? "Change photo" : "Choose photo"}
            </span>
          </button>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-2xs uppercase tracking-widest text-ink-dim mb-2">
            Gender (optional)
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {GENDERS.map((g) => {
              const active = gender === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGender(active ? "" : g.value)}
                  className={[
                    "h-10 rounded-md text-xs font-medium transition-colors border",
                    active
                      ? "bg-accent text-accent-ink border-accent"
                      : "bg-bg-elev text-ink-muted border-line hover:text-ink hover:bg-bg-hover",
                  ].join(" ")}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Height"
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          trailing="cm"
        />

        <Input
          label="Weight"
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          trailing={unit}
        />

        {error && (
          <p className="text-2xs text-danger" role="alert">
            {error}
          </p>
        )}

        <div className="space-y-2 pt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={saving}
            onClick={() => save(true)}
          >
            Continue
          </Button>
          <button
            type="button"
            onClick={() => save(true)}
            className="w-full text-xs text-ink-muted hover:text-ink py-2 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </main>
  );
}
