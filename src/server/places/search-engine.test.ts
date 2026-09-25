import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { distanceKm } from "@/lib/geo";
import { registerUser } from "../auth/accounts";
import type { AuthContext } from "../auth/session";
import { getDb } from "../db/client";
import { organizations } from "../db/schema";
import { continueSearch, startSearch } from "./search-engine";

async function makeAuth(plan: "free" | "pro" | "business" = "free"): Promise<AuthContext> {
  const email = `u${Math.random().toString(36).slice(2)}@teste.com`;
  const { userId, orgId } = await registerUser({ name: "Teste", email, password: "12345678" });
  const db = await getDb();
  await db.update(organizations).set({ plan }).where(eq(organizations.id, orgId));
  return { sessionId: "x", user: { id: userId, email, name: "Teste", avatarUrl: null, title: null }, org: { id: orgId, name: "Org", plan }, role: "owner" };
}

describe("motor de busca (provedor de demonstração)", () => {
  it("busca local com texto e marca os dados como demonstração", async () => {
    const auth = await makeAuth();
    const result = await startSearch(auth, { q: "barbearias", city: "Curitiba" });
    expect(result.demo).toBe(true);
    expect(result.description).toBe("barbearias em Curitiba");
    expect(result.places.length).toBeGreaterThan(0);
    expect(result.places.every((p) => p.demo)).toBe(true);
    expect(result.moreLockedByPlan).toBe(true);
    expect(result.hasMore).toBe(false);
  });

  it("busca por raio só devolve empresas dentro do raio e calcula a distância", async () => {
    const auth = await makeAuth("pro");
    const center = { lat: -25.4284, lng: -49.2733 };
    const result = await startSearch(auth, { q: "academias", scope: "raio", radiusKm: 3, center });
    expect(result.places.length).toBeGreaterThan(0);
    for (const place of result.places) {
      expect(distanceKm(center, place.location!)).toBeLessThanOrEqual(3 * 1.02);
      expect(place.distanceKm).not.toBeNull();
    }
    const more = await continueSearch(auth, result.searchId);
    expect(Array.isArray(more.places)).toBe(true);
  });

  it("respeita o plano: varredura e pesquisas do mês", async () => {
    const free = await makeAuth("free");
    await expect(startSearch(free, { q: "lojas", city: "Recife", sweep: 2 })).rejects.toThrow(/Varredura|varredura/);
    const pro = await makeAuth("pro");
    const swept = await startSearch(pro, { q: "lojas", city: "Recife", sweep: 2 });
    expect(swept.regions).toBe(4);
    expect(new Set(swept.places.map((p) => p.id)).size).toBe(swept.places.length);
  });

  it("não deixa continuar a pesquisa de outro usuário", async () => {
    const a = await makeAuth("pro");
    const b = await makeAuth("pro");
    const result = await startSearch(a, { q: "hotéis", city: "Lisboa" });
    await expect(continueSearch(b, result.searchId)).rejects.toThrow(/não encontrada/);
  });

  it("exige o que procurar", async () => {
    await expect(startSearch(await makeAuth(), { q: "  " })).rejects.toThrow(/Diga o que você procura/);
  });
});
