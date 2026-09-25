import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/SettingsView";
import { requirePageAuth } from "@/server/auth/session";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const auth = await requirePageAuth();
  return <SettingsView email={auth.user.email} />;
}
