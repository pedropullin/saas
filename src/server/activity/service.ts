import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { activities, users } from "../db/schema";

export type ActivityType =
  | "busca"
  | "lead_criado"
  | "lead_status"
  | "lead_contato"
  | "lead_nota"
  | "lead_atribuido"
  | "lista_criada"
  | "lista_adicao"
  | "membro_entrou"
  | "importacao"
  | "exportacao"
  | "plano";

export async function logActivity(input: {
  orgId: string;
  userId: string | null;
  type: ActivityType;
  summary: string;
  entityId?: string | null;
}): Promise<void> {
  const db = await getDb();
  await db.insert(activities).values({
    orgId: input.orgId,
    userId: input.userId,
    type: input.type,
    summary: input.summary.slice(0, 300),
    entityId: input.entityId ?? null,
  });
}

export async function recentActivity(orgId: string, limit = 20) {
  const db = await getDb();
  return db
    .select({
      id: activities.id,
      type: activities.type,
      summary: activities.summary,
      entityId: activities.entityId,
      createdAt: activities.createdAt,
      userId: activities.userId,
      userName: users.name,
      userAvatar: users.avatarUrl,
    })
    .from(activities)
    .leftJoin(users, eq(users.id, activities.userId))
    .where(eq(activities.orgId, orgId))
    .orderBy(desc(activities.createdAt))
    .limit(limit);
}
