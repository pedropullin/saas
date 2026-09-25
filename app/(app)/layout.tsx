import { cookies } from "next/headers";
import { AppHeader } from "@/components/app/AppHeader";
import { AppSessionProvider } from "@/components/app/AppSession";
import { Toaster } from "@/components/ui/Toaster";
import { isGateEnabled, readSessionToken, SESSION_COOKIE } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);

  return (
    <AppSessionProvider
      value={{
        userName: session?.name ?? null,
        gateEnabled: isGateEnabled(),
        demo: !process.env.GOOGLE_MAPS_API_KEY,
        mapsKey: process.env.GOOGLE_MAPS_BROWSER_KEY || null,
      }}
    >
      <div className="flex h-dvh flex-col overflow-hidden">
        <AppHeader />
        {children}
      </div>
      <Toaster />
    </AppSessionProvider>
  );
}
