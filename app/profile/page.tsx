"use client";

import { Hydrated } from "@/components/Hydrated";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { AppHeader } from "@/components/ui/BottomNav";
import { useAuth } from "@/lib/auth";
import { fileToSquareDataUrl } from "@/lib/photo";
import { useProfile, type Gender } from "@/lib/profile";
import { useStore } from "@/lib/store";
import { Camera, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const GENDER_LABELS: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  "prefer-not-to-say": "Prefer not to say",
};

const GENDERS: Gender[] = ["male", "female", "other", "prefer-not-to-say"];

function ProfileScreen() {
  const auth = useAuth();
  const profile = useProfile();
  const router = useRouter();
  const unit = useStore((s) => s.settings.unit);

  const [editing, setEditing] = useState(false);
  const [gender, setGender] = useState<Gender | "">("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!auth.userId) return;
    profile.load(auth.userId);
  }, [auth.userId]); // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit() {
    const p = profile.profile;
    setGender(p?.gender ?? "");
    setHeight(p?.height != null ? String(p.height) : "");
    setWeight(p?.weight != null ? String(p.weight) : "");
    setPhoto(p?.photoDataUrl);
    setEditing(true);
  }

  async function onPhotoPicked(file: File | undefined) {
    if (!file) return;
    try {
      const dataUrl = await fileToSquareDataUrl(file, 256, 0.7);
      setPhoto(dataUrl);
    } catch {
      /* ignore */
    }
  }

  function saveEdits() {
    profile.save({
      gender: gender || undefined,
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      photoDataUrl: photo,
    });
    setEditing(false);
  }

  function signOut() {
    if (!confirm("Sign out of this account?")) return;
    auth.signOut();
    profile.clear();
    router.replace("/login");
  }

  const p = profile.profile;

  return (
    <main className="app-container pt-4 space-y-4">
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-bg-elev border border-line overflow-hidden flex items-center justify-center shrink-0">
            {p?.photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.photoDataUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={26} className="text-ink-dim" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">
              {auth.email ?? "—"}
            </p>
            <p className="text-2xs text-ink-dim">
              Signed in on this device
            </p>
          </div>
        </div>
      </Card>

      {!editing ? (
        <Card>
          <CardBody className="space-y-3 pt-4">
            <Row label="Gender" value={p?.gender ? GENDER_LABELS[p.gender] : "—"} />
            <Row
              label="Height"
              value={p?.height != null ? `${p.height} cm` : "—"}
            />
            <Row
              label="Weight"
              value={p?.weight != null ? `${p.weight} ${unit}` : "—"}
            />
            <Button
              variant="secondary"
              className="w-full mt-2"
              onClick={startEdit}
            >
              Edit profile
            </Button>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="space-y-3 pt-4">
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
              className="flex items-center gap-3"
            >
              <div className="h-14 w-14 rounded-full bg-bg-elev border border-line overflow-hidden flex items-center justify-center">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={22} className="text-ink-dim" />
                )}
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-accent">
                <Camera size={13} /> Change photo
              </span>
            </button>

            <div>
              <span className="block text-2xs uppercase tracking-widest text-ink-dim mb-1.5">
                Gender
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {GENDERS.map((g) => {
                  const active = gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(active ? "" : g)}
                      className={[
                        "h-10 rounded-md text-xs font-medium transition-colors border",
                        active
                          ? "bg-accent text-accent-ink border-accent"
                          : "bg-bg-elev text-ink-muted border-line hover:text-ink hover:bg-bg-hover",
                      ].join(" ")}
                    >
                      {GENDER_LABELS[g]}
                    </button>
                  );
                })}
              </div>
            </div>

            <Input
              label="Height"
              type="number"
              inputMode="decimal"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              trailing="cm"
            />
            <Input
              label="Weight"
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              trailing={unit}
            />

            <div className="flex gap-2 pt-1">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={saveEdits}
              >
                Save
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <Button
        variant="danger"
        className="w-full"
        onClick={signOut}
      >
        <LogOut size={14} /> Sign out
      </Button>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-2xs uppercase tracking-widest text-ink-dim">
        {label}
      </span>
      <span className="text-sm text-ink tabular-nums">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <>
      <AppHeader title="Profile" />
      <Hydrated>
        <ProfileScreen />
      </Hydrated>
    </>
  );
}
