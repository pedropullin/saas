import type { Metadata } from "next";
import { HistoryList } from "@/components/lists/HistoryList";
import { PageHeader } from "@/components/ui/misc";
import { requirePageAuth } from "@/server/auth/session";
import { listHistory } from "@/server/history/service";

export const metadata: Metadata = { title: "Histórico" };

export default async function HistoricoPage() {
  const auth = await requirePageAuth();
  const entries = await listHistory(auth);
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader eyebrow="Pessoal" title="Histórico" description="Suas últimas pesquisas. Só você vê o seu histórico." />
      <HistoryList entries={entries} />
    </div>
  );
}
