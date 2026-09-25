import type { Metadata } from "next";
import Link from "next/link";
import { CompanyView } from "@/components/company/CompanyView";
import { buttonClass } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/misc";
import { EMPTY_SAVED, type PlaceDetails } from "@/lib/types";
import { requirePageAuth } from "@/server/auth/session";
import { savedStateFor, upsertCompanies } from "@/server/companies/service";
import { getPlacesProvider, isValidPlaceId, PlacesError } from "@/server/places";

export const metadata: Metadata = { title: "Empresa" };

export default async function EmpresaPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePageAuth();
  const id = decodeURIComponent((await params).id);

  let details: PlaceDetails | null = null;
  let error: string | null = null;
  if (!isValidPlaceId(id)) error = "Endereço de empresa inválido.";
  else {
    try {
      details = await getPlacesProvider().details(id);
    } catch (err) {
      error = err instanceof PlacesError ? err.message : "Não foi possível carregar os dados desta empresa agora.";
    }
  }

  if (!details) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <ErrorState
          title="Empresa indisponível"
          message={error ?? "Dados não encontrados."}
          action={
            <Link href="/app/prospectar" className={buttonClass("outline", "sm")}>
              Voltar para a busca
            </Link>
          }
        />
      </div>
    );
  }

  const { saved, enrichment } = await savedStateFor(auth.org.id, auth.user.id, [details.id]);
  const state = saved[details.id] ?? EMPTY_SAVED;
  // Empresa já salva pela equipe: renova a cópia dos dados.
  if (state.companyId) {
    const { reviews: _reviews, summary: _summary, ...place } = details;
    await upsertCompanies(auth.org.id, [place]);
  }

  return <CompanyView details={details} saved={state} enrichment={enrichment[details.id] ?? null} />;
}
