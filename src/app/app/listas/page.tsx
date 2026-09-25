import type { Metadata } from "next";
import { ListsIndex } from "@/components/lists/ListsIndex";
import { getPlan } from "@/lib/plans";
import { requirePageAuth } from "@/server/auth/session";
import { listLists } from "@/server/lists/service";

export const metadata: Metadata = { title: "Listas" };

export default async function ListasPage() {
  const auth = await requirePageAuth();
  const lists = await listLists(auth.org.id);
  return (
    <ListsIndex
      maxLists={getPlan(auth.org.plan).maxLists}
      lists={lists.map((l) => ({ id: l.id, name: l.name, description: l.description, count: l.count, updatedAt: l.updatedAt.toISOString(), createdByName: l.createdByName }))}
    />
  );
}
