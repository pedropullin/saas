"use server";

import { z } from "zod";
import { SERVICES } from "@/lib/opportunity";
import { withAuth } from "../action";
import { changePassword } from "../auth/accounts";
import { updateOrgName, updatePreferences, updateProfile } from "./service";

const location = z.object({ label: z.string().trim().min(1).max(120), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).nullable();

const preferences = z.object({
  location: location.optional(),
  defaultRadiusKm: z.number().int().min(1).max(50).optional(),
  service: z.enum(SERVICES.map((s) => s.id) as [string, ...string[]]).optional(),
  autoEnrich: z.boolean().optional(),
  templates: z
    .array(z.object({ id: z.string().min(1).max(60), name: z.string().trim().min(1).max(60), body: z.string().trim().min(1).max(2000) }))
    .min(1)
    .max(20)
    .optional(),
  activeTemplateId: z.string().max(60).optional(),
});

export async function updatePreferencesAction(patch: z.input<typeof preferences>) {
  return withAuth(async (auth) => {
    const parsed = preferences.parse(patch);
    await updatePreferences(auth.user.id, parsed as Parameters<typeof updatePreferences>[1]);
  });
}

export async function updateProfileAction(patch: { name?: string; title?: string | null; avatarUrl?: string | null }) {
  return withAuth((auth) =>
    updateProfile(
      auth.user.id,
      z
        .object({ name: z.string().trim().min(2, "Informe seu nome.").max(60).optional(), title: z.string().max(60).nullable().optional(), avatarUrl: z.string().max(400_000).nullable().optional() })
        .parse(patch),
    ),
  );
}

export async function updateOrgNameAction(name: string) {
  return withAuth((auth) => updateOrgName(auth, z.string().trim().min(2, "Nome muito curto.").max(80).parse(name)));
}

export async function changePasswordAction(current: string, next: string) {
  return withAuth((auth) =>
    changePassword(auth.user.id, z.string().min(1).max(200).parse(current), z.string().min(8, "A nova senha precisa de 8 caracteres ou mais.").max(200).parse(next)),
  );
}
