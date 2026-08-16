import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { identities, getIdentityById } from "@/lib/mock/identities";
import { getBrandBookByIdentityId } from "@/lib/mock/brandbooks";
import { BrandBookLayout } from "@/components/product/BrandBookLayout";

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
  return { title: identity ? `Brand Book — ${identity.brandName}` : "Brand Book" };
}

export default async function BrandBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const identity = getIdentityById(id);
  const brandBook = getBrandBookByIdentityId(id);
  if (!identity || !brandBook) notFound();

  return <BrandBookLayout identity={identity} brandBook={brandBook} />;
}
