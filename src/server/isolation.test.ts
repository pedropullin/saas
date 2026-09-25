import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import type { Place } from "@/lib/types";
import { createInvitation, registerUser } from "./auth/accounts";
import type { AuthContext } from "./auth/session";
import { getDb } from "./db/client";
import { organizations } from "./db/schema";
import { listFavorites, toggleFavorite } from "./favorites/service";
import { addNote, createLeadsFromPlaces, getLead, listLeads, moveLeads, updateLead } from "./leads/service";
import { addPlacesToList, createList, getListWithItems, listLists } from "./lists/service";
import { getDashboard } from "./analytics/service";

function place(id: string, name: string): Place {
  return {
    id,
    name,
    category: "Restaurante",
    types: [],
    address: null,
    neighborhood: null,
    city: "Curitiba",
    state: null,
    country: null,
    postalCode: null,
    location: { lat: -25.4, lng: -49.2 },
    rating: 4.6,
    reviewCount: 120,
    phone: { national: "(41) 99999-0000", international: "+55 41 99999-0000", e164: "+5541999990000", kind: "celular", country: "BR" },
    whatsapp: { number: "5541999990000", link: null, confidence: "provavel", source: "telefone" },
    website: null,
    instagram: null,
    facebook: null,
    mapsUrl: null,
    openNow: null,
    hours: [],
    status: "OPERATIONAL",
    priceLevel: null,
    photos: [],
  };
}

async function account(name: string, plan: "free" | "business" = "business"): Promise<AuthContext> {
  const email = `${name.toLowerCase()}-${Math.random().toString(36).slice(2)}@teste.com`;
  const { userId, orgId } = await registerUser({ name, email, password: "12345678" });
  const db = await getDb();
  await db.update(organizations).set({ plan }).where(eq(organizations.id, orgId));
  return { sessionId: "s", user: { id: userId, email, name, avatarUrl: null, title: null }, org: { id: orgId, name, plan }, role: "owner" };
}

describe("isolamento entre organizações", () => {
  it("leads, listas e favoritos de uma conta não aparecem nem podem ser alterados por outra", async () => {
    const alice = await account("Alice");
    const bob = await account("Bob");

    const { leadIds } = await createLeadsFromPlaces(alice, [place("ChIJalice0001", "Cantina da Alice")]);
    const leadId = leadIds["ChIJalice0001"]!;
    const list = await createList(alice, "Restaurantes Curitiba");
    await addPlacesToList(alice, list.id, [place("ChIJalice0001", "Cantina da Alice")]);
    await toggleFavorite(alice, place("ChIJalice0001", "Cantina da Alice"));

    expect(await listLeads(bob.org.id)).toEqual([]);
    expect(await getLead(bob.org.id, leadId)).toBeNull();
    expect(await listLists(bob.org.id)).toEqual([]);
    expect(await listFavorites(bob)).toEqual([]);
    await expect(getListWithItems(bob.org.id, list.id)).rejects.toThrow(/não encontrada/);
    await expect(updateLead(bob, leadId, { notes: "invasão" })).rejects.toThrow(/não encontrado/);
    await expect(moveLeads(bob, [leadId], "cliente")).rejects.toThrow(/não encontrado/);
    await expect(addNote(bob, leadId, "x")).rejects.toThrow(/não encontrado/);
    await expect(addPlacesToList(bob, list.id, [place("ChIJbob000001", "Bar do Bob")])).rejects.toThrow(/não encontrada/);

    const aliceLead = await getLead(alice.org.id, leadId);
    expect(aliceLead?.lead.notes).toBe("");
    expect((await getDashboard(bob.org.id)).leadsTotal).toBe(0);
  });

  it("membros da mesma equipe compartilham leads e listas; favoritos continuam pessoais", async () => {
    const owner = await account("Dona");
    const invite = await createInvitation(owner.org.id, owner.user.id);
    const email = `amigo-${Math.random().toString(36).slice(2)}@teste.com`;
    const friendIds = await registerUser({ name: "Amigo", email, password: "12345678", inviteToken: invite.token });
    const friend: AuthContext = { ...owner, sessionId: "f", user: { id: friendIds.userId, email, name: "Amigo", avatarUrl: null, title: null }, role: "member" };

    await createLeadsFromPlaces(owner, [place("ChIJteam00001", "Padaria do Time")]);
    await toggleFavorite(owner, place("ChIJteam00001", "Padaria do Time"));
    const leads = await listLeads(friend.org.id);
    expect(leads.map((l) => l.companyName)).toEqual(["Padaria do Time"]);
    expect(await listFavorites(friend)).toEqual([]);

    await updateLead(owner, leads[0]!.id, { assignedTo: friend.user.id });
    const after = await listLeads(owner.org.id);
    expect(after[0]!.assignedName).toBe("Amigo");
  });

  it("limite de leads do plano Free", async () => {
    const free = await account("Free", "free");
    const many = Array.from({ length: 51 }, (_, i) => place(`ChIJfree${String(i).padStart(4, "0")}`, `Empresa ${i}`));
    await expect(createLeadsFromPlaces(free, many)).rejects.toThrow(/50 leads/);
  });
});
