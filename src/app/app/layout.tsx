import { AppProvider } from "@/components/shell/AppContext";
import { MobileNav } from "@/components/shell/MobileNav";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { Toaster } from "@/components/ui/Toaster";
import { getPlan } from "@/lib/plans";
import { requirePageAuth } from "@/server/auth/session";
import { getUsage } from "@/server/billing/usage";
import { listNotifications } from "@/server/notifications/service";
import { isDemoMode } from "@/server/places";
import { getPreferences } from "@/server/settings/service";
import { listUserOrgs } from "@/server/team/service";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const auth = await requirePageAuth();
  const [prefs, orgs, usage, notifications] = await Promise.all([
    getPreferences(auth.user.id),
    listUserOrgs(auth.user.id),
    getUsage(auth.org.id),
    listNotifications(auth.org.id, auth.user.id, 1),
  ]);
  const demo = isDemoMode();

  return (
    <AppProvider
      value={{
        user: auth.user,
        org: { id: auth.org.id, name: auth.org.name },
        role: auth.role,
        plan: getPlan(auth.org.plan),
        orgs: orgs.map((o) => ({ id: o.id, name: o.name, role: o.role })),
        usage: { searches: usage.searches },
        unread: notifications.unread,
        demo,
        mapsKey: process.env.GOOGLE_MAPS_BROWSER_KEY?.trim() || null,
        prefs,
      }}
    >
      <div className="flex h-dvh overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          {demo && (
            <div className="shrink-0 border-b border-brand/30 bg-brand-deep/60 px-4 py-1.5 text-center text-[12px] text-paper/90">
              <strong className="font-semibold text-white">Modo demonstração:</strong> empresas fictícias e contato bloqueado.
              <span className="hidden md:inline"> Configure GOOGLE_MAPS_API_KEY para buscar empresas reais.</span>
            </div>
          )}
          <main id="conteudo" className="relative min-h-0 flex-1 overflow-y-auto pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
            {children}
          </main>
        </div>
        <MobileNav />
        <Toaster />
      </div>
    </AppProvider>
  );
}
