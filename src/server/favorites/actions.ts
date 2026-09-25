"use server";

import { z } from "zod";
import { placeSchema } from "@/lib/place-schema";
import type { Place } from "@/lib/types";
import { withAuth } from "../action";
import { removeFavorite, toggleFavorite } from "./service";

export async function toggleFavoriteAction(place: unknown) {
  return withAuth((auth) => toggleFavorite(auth, placeSchema.parse(place) as Place));
}

export async function removeFavoriteAction(companyId: string) {
  return withAuth((auth) => removeFavorite(auth, z.uuid().parse(companyId)));
}
