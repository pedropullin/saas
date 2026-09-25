import "server-only";
import { eq } from "drizzle-orm";
import type { ServiceFocus } from "@/lib/opportunity";
import { DEFAULT_TEMPLATES, type MessageTemplate } from "@/lib/whatsapp";
import type { AuthContext } from "../auth/session";
import { requireRole } from "../auth/session";
import { getDb } from "../db/client";
import { organizations, userSettings, users } from "../db/schema";
import { AppError } from "../errors";

export interface UserPreferences {
  location: { label: string; lat: number; lng: number } | null;
  defaultRadiusKm: number;
  service: ServiceFocus;
  autoEnrich: boolean;
  templates: MessageTemplate[];
  activeTemplateId: string;
}

export async function getPreferences(userId: string): Promise<UserPreferences> {
  const db = await getDb();
  let [row] = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  if (!row) [row] = await db.insert(userSettings).values({ userId }).onConflictDoNothing().returning();
  const templates = row?.messageTemplates?.length ? row.messageTemplates : DEFAULT_TEMPLATES;
  return {
    location:
      row?.locationLat != null && row.locationLng != null
        ? { label: row.locationLabel ?? "Minha localização", lat: row.locationLat, lng: row.locationLng }
        : null,
    defaultRadiusKm: row?.defaultRadiusKm ?? 10,
    service: (row?.service as ServiceFocus) ?? "sites",
    autoEnrich: row?.autoEnrich ?? true,
    templates,
    activeTemplateId: templates.some((t) => t.id === row?.activeTemplateId) ? row!.activeTemplateId! : templates[0]!.id,
  };
}

export async function updatePreferences(
  userId: string,
  patch: Partial<Omit<UserPreferences, "location">> & { location?: UserPreferences["location"] },
) {
  const db = await getDb();
  await getPreferences(userId);
  await db
    .update(userSettings)
    .set({
      ...(patch.location !== undefined
        ? { locationLabel: patch.location?.label ?? null, locationLat: patch.location?.lat ?? null, locationLng: patch.location?.lng ?? null }
        : {}),
      ...(patch.defaultRadiusKm !== undefined ? { defaultRadiusKm: patch.defaultRadiusKm } : {}),
      ...(patch.service !== undefined ? { service: patch.service } : {}),
      ...(patch.autoEnrich !== undefined ? { autoEnrich: patch.autoEnrich } : {}),
      ...(patch.templates !== undefined ? { messageTemplates: patch.templates } : {}),
      ...(patch.activeTemplateId !== undefined ? { activeTemplateId: patch.activeTemplateId } : {}),
      updatedAt: new Date(),
    })
    .where(eq(userSettings.userId, userId));
}

export async function updateProfile(userId: string, patch: { name?: string; title?: string | null; avatarUrl?: string | null }) {
  if (patch.avatarUrl && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(patch.avatarUrl)) {
    throw new AppError("Imagem inválida. Use PNG, JPG ou WebP.");
  }
  if (patch.avatarUrl && patch.avatarUrl.length > 400_000) throw new AppError("Imagem muito grande (máx. 300 KB).");
  const db = await getDb();
  await db
    .update(users)
    .set({
      ...(patch.name !== undefined ? { name: patch.name.trim().slice(0, 60) || "Sem nome" } : {}),
      ...(patch.title !== undefined ? { title: patch.title?.trim().slice(0, 60) || null } : {}),
      ...(patch.avatarUrl !== undefined ? { avatarUrl: patch.avatarUrl } : {}),
    })
    .where(eq(users.id, userId));
}

export async function updateOrgName(auth: AuthContext, name: string) {
  requireRole(auth, ["owner", "admin"]);
  const db = await getDb();
  await db.update(organizations).set({ name: name.trim().slice(0, 80) || auth.org.name }).where(eq(organizations.id, auth.org.id));
}
