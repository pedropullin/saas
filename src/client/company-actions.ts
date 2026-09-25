"use client";

import type { Enrichment, Place, ResultPlace } from "@/lib/types";
import { toggleFavoriteAction } from "@/server/favorites/actions";
import { addPlacesToLeadsAction, registerPlaceContactAction } from "@/server/leads/actions";
import { addPlacesToListAction, createListAction } from "@/server/lists/actions";
import { navigate } from "./navigation";
import { searchActions, toPlace } from "./search-store";
import { toast } from "./toast";

type AnyPlace = Place | ResultPlace;

function plain(place: AnyPlace): Place {
  return "saved" in place ? toPlace(place as ResultPlace) : place;
}

function enrichmentOf(places: AnyPlace[], extra?: Record<string, Enrichment | null>) {
  const map: Record<string, Enrichment | null> = { ...extra };
  for (const place of places) if ("enrichment" in place && place.enrichment) map[place.id] = place.enrichment;
  return map;
}

export async function saveLeads(places: AnyPlace[], extra?: Record<string, Enrichment | null>) {
  if (!places.length) return null;
  const result = await addPlacesToLeadsAction(places.map(plain), enrichmentOf(places, extra));
  if (!result.ok) {
    toast.error(result.error);
    return null;
  }
  for (const [placeId, leadId] of Object.entries(result.data.leadIds)) {
    searchActions.patchSaved(placeId, { leadId, leadStatus: "novo" });
  }
  const { created } = result.data;
  toast.success(
    created === 0 ? "Essas empresas já estavam nos seus leads." : created === 1 ? `${places[0]!.name} foi adicionada aos leads.` : `${created} empresas adicionadas aos leads.`,
    { label: "Ver leads", onClick: () => navigate("/app/leads") },
  );
  return result.data;
}

export async function toggleFavorite(place: AnyPlace) {
  const result = await toggleFavoriteAction(plain(place));
  if (!result.ok) {
    toast.error(result.error);
    return null;
  }
  searchActions.patchSaved(place.id, { favorite: result.data });
  toast.success(result.data ? `${place.name} salva nos favoritos.` : `${place.name} saiu dos favoritos.`);
  return result.data;
}

export async function addToList(listId: string, listName: string, places: AnyPlace[]) {
  const result = await addPlacesToListAction(listId, places.map(plain));
  if (!result.ok) {
    toast.error(result.error);
    return false;
  }
  for (const place of places) {
    const listIds = "saved" in place ? (place as ResultPlace).saved.listIds : [];
    searchActions.patchSaved(place.id, { listIds: [...new Set([...listIds, listId])] });
  }
  toast.success(result.data ? `${result.data === 1 ? "1 empresa adicionada" : `${result.data} empresas adicionadas`} à lista “${listName}”.` : `Já estavam na lista “${listName}”.`);
  return true;
}

export async function createListWith(name: string, places: AnyPlace[]) {
  const result = await createListAction(name, null, places.map(plain));
  if (!result.ok) {
    toast.error(result.error);
    return null;
  }
  for (const place of places) {
    const listIds = "saved" in place ? (place as ResultPlace).saved.listIds : [];
    searchActions.patchSaved(place.id, { listIds: [...listIds, result.data.id] });
  }
  toast.success(`Lista “${result.data.name}” criada${places.length ? ` com ${places.length === 1 ? "1 empresa" : `${places.length} empresas`}` : ""}.`);
  return result.data;
}

/** Se a empresa já é lead, o clique em WhatsApp/Ligar entra no histórico dela. */
export async function trackContact(place: AnyPlace, channel: "whatsapp" | "ligacao") {
  if (place.demo) return;
  const result = await registerPlaceContactAction(place.id, channel);
  if (result.ok && result.data) searchActions.patchSaved(place.id, { leadId: result.data.leadId, leadStatus: result.data.status });
}
