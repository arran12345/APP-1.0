"use client";

import { create } from "zustand";

// ---------------------------------------------------------------------------
// Client-side accounts
// ---------------------------------------------------------------------------
//
// Honest scope: this provides identity separation, not authentication-grade
// security. Passwords are salted-SHA-256 hashed in localStorage, which is a
// reasonable bar for "different people on the same phone" but trivially
// readable by anyone with browser dev tools. Don't reuse important passwords.
//
// What it DOES do well:
// - Multiple accounts on the same install, each with their own data namespace.
// - Stay signed in across reloads (the user_id is persisted to localStorage).
// - Works fully offline. No backend, no env vars, no API keys, no recurring cost.
//
// What it does NOT do:
// - Cross-device sync. Each device has its own copy of accounts and data.
// - Email verification, password reset, anti-bruteforce, etc.
// ---------------------------------------------------------------------------

const ACCOUNTS_KEY = "pulse:accounts";
const SESSION_KEY = "pulse:session";

interface Account {
  id: string;
  email: string;          // stored lowercase for case-insensitive login
  passwordHash: string;   // hex SHA-256(salt + password)
  passwordSalt: string;   // hex, 16 bytes
  createdAt: string;
}

interface AuthState {
  userId: string | null;
  email: string | null;
  initialized: boolean;
  init: () => void;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  userId: null,
  email: null,
  initialized: false,

  init() {
    if (typeof localStorage === "undefined") {
      set({ initialized: true });
      return;
    }
    const session = readSession();
    set({
      userId: session.userId,
      email: session.email,
      initialized: true,
    });
  },

  async signUp(emailRaw, password) {
    const email = emailRaw.trim().toLowerCase();
    if (!email || !password) {
      return { error: "Email and password are required." };
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return { error: "That email doesn't look right." };
    }
    if (password.length < 6) {
      return { error: "Password must be at least 6 characters." };
    }
    const accounts = readAccounts();
    if (Object.values(accounts).some((a) => a.email === email)) {
      return { error: "An account with that email already exists." };
    }
    const salt = randomHex(16);
    const passwordHash = await sha256Hex(salt + password);
    const id = randomHex(12);
    accounts[id] = {
      id,
      email,
      passwordHash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
    };
    writeAccounts(accounts);
    writeSession({ userId: id, email });
    set({ userId: id, email });
    return {};
  },

  async signIn(emailRaw, password) {
    const email = emailRaw.trim().toLowerCase();
    if (!email || !password) {
      return { error: "Email and password are required." };
    }
    const accounts = readAccounts();
    const account = Object.values(accounts).find((a) => a.email === email);
    if (!account) {
      return { error: "No account with that email on this device." };
    }
    const hash = await sha256Hex(account.passwordSalt + password);
    if (hash !== account.passwordHash) {
      return { error: "Wrong password." };
    }
    writeSession({ userId: account.id, email: account.email });
    set({ userId: account.id, email: account.email });
    return {};
  },

  signOut() {
    writeSession({ userId: null, email: null });
    set({ userId: null, email: null });
  },
}));

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

function readAccounts(): Record<string, Account> {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeAccounts(accounts: Record<string, Account>): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function readSession(): { userId: string | null; email: string | null } {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "{}");
    return {
      userId: parsed.userId ?? null,
      email: parsed.email ?? null,
    };
  } catch {
    return { userId: null, email: null };
  }
}

function writeSession(s: { userId: string | null; email: string | null }): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

// Synchronously read the current user id from localStorage. Used by the
// data store's storage adapter to namespace reads/writes per account.
export function currentUserIdSync(): string | null {
  if (typeof localStorage === "undefined") return null;
  return readSession().userId;
}

// ---------------------------------------------------------------------------
// Crypto helpers
// ---------------------------------------------------------------------------

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomHex(byteLength: number): string {
  const arr = new Uint8Array(byteLength);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
