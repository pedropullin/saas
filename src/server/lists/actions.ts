"use server";

import { z } from "zod";
import { placeSchema } from "@/lib/place-schema";
import type { Place } from "@/lib/types";
import { withAuth } from "../action";
import {
  addCompanyIdsToList,
  addPlacesToList,
  createList,
  deleteList,
  listLists,
  removeFromList,
  updateList,
} from "./service";

const id = z.uuid();

export async function listListsAction() {
  return withAuth(async (auth) => (await listLists(auth.org.id)).map((l) => ({ id: l.id, name: l.name, count: l.count })));
}

export async function createListAction(name: string, description?: string | null, places: unknown[] = []) {
  return withAuth(async (auth) => {
    const list = await createList(auth, z.string().max(80).parse(name), description);
    const parsed = z.array(placeSchema).max(200).parse(places) as Place[];
    const added = parsed.length ? await addPlacesToList(auth, list.id, parsed) : 0;
    return { ...list, added };
  });
}

export async function updateListAction(listId: string, patch: { name?: string; description?: string | null }) {
  return withAuth((auth) => updateList(auth, id.parse(listId), patch));
}

export async function deleteListAction(listId: string) {
  return withAuth((auth) => deleteList(auth, id.parse(listId)));
}

export async function addPlacesToListAction(listId: string, places: unknown[]) {
  return withAuth((auth) => addPlacesToList(auth, id.parse(listId), z.array(placeSchema).min(1).max(200).parse(places) as Place[]));
}

export async function addCompaniesToListAction(listId: string, companyIds: string[]) {
  return withAuth((auth) => addCompanyIdsToList(auth, id.parse(listId), z.array(id).min(1).max(500).parse(companyIds)));
}

export async function removeFromListAction(listId: string, companyIds: string[]) {
  return withAuth((auth) => removeFromList(auth, id.parse(listId), z.array(id).min(1).max(500).parse(companyIds)));
}
