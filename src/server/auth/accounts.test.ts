import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { getDb } from "../db/client";
import { memberships, organizations } from "../db/schema";
import { acceptInvitation, authenticate, createInvitation, findInvitation, registerUser } from "./accounts";
import { hashPassword, verifyPassword } from "./crypto";

describe("senhas", () => {
  it("gera hash verificável e recusa senha errada", async () => {
    const hash = await hashPassword("segredo-forte");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("segredo-forte", hash)).toBe(true);
    expect(await verifyPassword("outra", hash)).toBe(false);
  });
});

describe("contas", () => {
  it("cadastra com organização própria e autentica", async () => {
    const { userId, orgId } = await registerUser({ name: "Ana Souza", email: "Ana@Exemplo.com", password: "12345678" });
    expect(await authenticate("ana@exemplo.com", "12345678")).toEqual({ userId, orgId });
    expect(await authenticate("ana@exemplo.com", "errada")).toBeNull();
    expect(await authenticate("ninguem@exemplo.com", "12345678")).toBeNull();
    await expect(registerUser({ name: "Ana", email: "ana@exemplo.com", password: "12345678" })).rejects.toThrow(/Já existe/);
  });

  it("respeita o limite de membros do plano e aceita convite de uso único", async () => {
    const owner = await registerUser({ name: "Bruno", email: "bruno@exemplo.com", password: "12345678" });
    await expect(createInvitation(owner.orgId, owner.userId)).rejects.toThrow(/Business/);

    const db = await getDb();
    await db.update(organizations).set({ plan: "business" }).where(eq(organizations.id, owner.orgId));
    const invite = await createInvitation(owner.orgId, owner.userId);
    expect((await findInvitation(invite.token))?.valid).toBe(true);

    const friend = await registerUser({ name: "Carla", email: "carla@exemplo.com", password: "12345678", inviteToken: invite.token });
    expect(friend.orgId).toBe(owner.orgId);
    const members = await db.select().from(memberships).where(eq(memberships.orgId, owner.orgId));
    expect(members.map((m) => m.role).sort()).toEqual(["member", "owner"]);

    await expect(acceptInvitation(invite.token, friend.userId)).rejects.toThrow(/Convite inválido/);
  });
});
