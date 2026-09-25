import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ListDetail } from "@/components/lists/ListDetail";
import { requirePageAuth } from "@/server/auth/session";
import { NotFoundError } from "@/server/errors";
import { getListWithItems } from "@/server/lists/service";

export const metadata: Metadata = { title: "Lista" };

export default async function ListaPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePageAuth();
  const id = z.uuid().safeParse((await params).id);
  if (!id.success) notFound();
  const data = await getListWithItems(auth.org.id, id.data).catch((error) => {
    if (error instanceof NotFoundError) return null;
    throw error;
  });
  if (!data) notFound();
  return <ListDetail list={{ id: data.list.id, name: data.list.name, description: data.list.description }} items={data.items} />;
}
