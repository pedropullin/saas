"use client";

import { createContext, useContext } from "react";
import { useSettings } from "@/lib/settings";

export interface AppSessionValue {
  userName: string | null;
  gateEnabled: boolean;
  demo: boolean;
  mapsKey: string | null;
}

const AppSessionContext = createContext<AppSessionValue>({
  userName: null,
  gateEnabled: false,
  demo: true,
  mapsKey: null,
});

export function AppSessionProvider({ value, children }: { value: AppSessionValue; children: React.ReactNode }) {
  return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>;
}

export function useAppSession(): AppSessionValue {
  return useContext(AppSessionContext);
}

/** Nome usado nas mensagens: o das configurações ou o do login. */
export function useMyName(): string {
  const { userName } = useAppSession();
  const settings = useSettings();
  return settings.myName.trim() || userName || "";
}
