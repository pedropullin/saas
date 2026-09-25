import { Heart } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { FavoritesTable } from "@/components/lists/FavoritesTable";
import { buttonClass } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { requirePageAuth } from "@/server/auth/session";
import { listFavorites } from "@/server/favorites/service";

export const metadata: Metadata = { title: "Favoritos" };

export default async function FavoritosPage() {
  const auth = await requirePageAuth();
  const items = await listFavorites(auth);
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader eyebrow="Pessoal" title="Favoritos" description="Empresas que você salvou para depois. Só você vê seus favoritos." />
      {items.length === 0 ? (
        <EmptyState
          icon={<Heart size={22} />}
          title="Nenhum favorito ainda"
          description="Use o marcador “Salvar” nos resultados da busca ou na página da empresa."
          action={
            <Link href="/app/prospectar" className={buttonClass("primary", "md")}>
              Encontrar empresas
            </Link>
          }
        />
      ) : (
        <FavoritesTable items={items} />
      )}
    </div>
  );
}
