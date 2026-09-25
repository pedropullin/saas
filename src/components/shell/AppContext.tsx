"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { registerNavigator } from "@/client/navigation";
import { toast } from "@/client/toast";
import type { Plan } from "@/lib/plans";
import { updatePreferencesAction } from "@/server/settings/actions";
import type { UserPreferences } from "@/server/settings/service";

export interface AppContextValue {
  user: { id: string; name: string; email: string; avatarUrl: string | null; title: string | null };
  org: { id: string; name: string };
  role: "owner" | "admin" | "member";
  plan: Plan;
  orgs: Array<{ id: string; name: string; role: string }>;
  usage: { searches: number };
  unread: number;
  demo: boolean;
  mapsKey: string | null;
  prefs: UserPreferences;
}

interface Ctx extends AppContextValue {
  setPrefs: (patch: Partial<UserPreferences>) => Promise<boolean>;
  bumpUsage: (searches: number) => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ value, children }: { value: AppContextValue; children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => registerNavigator((href) => router.push(href)), [router]);
  const [prefs, setPrefsState] = useState(value.prefs);
  const [usage, setUsage] = useState(value.usage);

  const setPrefs = useCallback(async (patch: Partial<UserPreferences>) => {
    let previous: UserPreferences | undefined;
    setPrefsState((current) => {
      previous = current;
      return { ...current, ...patch };
    });
    const result = await updatePreferencesAction(patch);
    if (!result.ok) {
      if (previous) setPrefsState(previous);
      toast.error(result.error);
      return false;
    }
    return true;
  }, []);

  const bumpUsage = useCallback((searches: number) => setUsage((u) => ({ searches: u.searches + searches })), []);

  return <AppCtx.Provider value={{ ...value, prefs, usage, setPrefs, bumpUsage }}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp fora do AppProvider");
  return ctx;
}
