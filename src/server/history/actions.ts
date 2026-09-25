"use server";

import { z } from "zod";
import { withAuth } from "../action";
import { deleteHistory } from "./service";

export async function deleteHistoryAction(searchId?: string) {
  return withAuth((auth) => deleteHistory(auth, searchId ? z.uuid().parse(searchId) : undefined));
}
