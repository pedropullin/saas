import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { identities, getIdentityById } from "@/lib/mock/identities";
import { IdentityResultView } from "@/components/product/IdentityResultView";

export function generateStaticParams() {
  return identities.map((identity) => ({ id: identity.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const identity = getIdentityById(id);
  return { title: identity ? `Identidade — ${identity.brandName}` : "Identidade" };
}

export default async function IdentidadePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const identity = getIdentityById(id);
  if (!identity) notFound();

  return <IdentityResultView identity={identity} />;
}
