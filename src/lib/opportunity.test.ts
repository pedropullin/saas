import { describe, expect, it } from "vitest";
import { contactFacts } from "./contact";
import { analyzeOpportunity } from "./opportunity";
import type { Enrichment, Place } from "./types";

const base: Place = {
  id: "ChIJabcdefgh",
  name: "Padaria Boa",
  category: "Padaria",
  types: [],
  address: null,
  neighborhood: null,
  city: "Curitiba",
  state: null,
  country: null,
  postalCode: null,
  location: null,
  rating: 4.8,
  reviewCount: 683,
  phone: { national: "(41) 99999-8888", international: "+55 41 99999-8888", e164: "+5541999998888", kind: "celular", country: "BR" },
  whatsapp: { number: "5541999998888", link: null, confidence: "provavel", source: "telefone" },
  website: null,
  instagram: "https://instagram.com/padariaboa",
  facebook: null,
  mapsUrl: null,
  openNow: true,
  hours: [],
  status: "OPERATIONAL",
  priceLevel: null,
  photos: [],
};

describe("contactFacts", () => {
  it("sem site, e-mail e Facebook são 'não encontrado' (não há onde procurar)", () => {
    const facts = contactFacts(base, null);
    expect(facts.website.state).toBe("missing");
    expect(facts.email.state).toBe("missing");
    expect(facts.instagram).toEqual({ state: "found", value: "https://instagram.com/padariaboa" });
  });

  it("com site ainda não lido, e-mail fica 'não verificado'; depois da leitura usa o que foi achado", () => {
    const withSite = { ...base, website: "https://padaria.com.br" };
    expect(contactFacts(withSite, null).email.state).toBe("unknown");
    const enrichment: Enrichment = {
      url: withSite.website,
      ok: true,
      emails: ["oi@padaria.com.br"],
      instagram: null,
      facebook: "https://facebook.com/padaria",
      linkedin: null,
      whatsapp: "5541988887777",
      fetchedAt: new Date().toISOString(),
    };
    const facts = contactFacts(withSite, enrichment);
    expect(facts.email).toEqual({ state: "found", value: "oi@padaria.com.br" });
    expect(facts.whatsapp).toMatchObject({ state: "found", value: { number: "5541988887777", confidence: "confirmado" } });
  });
});

describe("analyzeOpportunity", () => {
  it("empresa forte sem site é oportunidade alta", () => {
    const result = analyzeOpportunity(base, null, "sites");
    expect(result.level).toBe("alta");
    expect(result.potential).toBe(true);
    expect(result.headline).toBe("Empresa com presença local forte e sem website identificado.");
  });

  it("não inventa: sem avaliações não cita nota", () => {
    const result = analyzeOpportunity({ ...base, rating: null, reviewCount: null }, null);
    expect(result.reasons.join(" ")).not.toMatch(/nota/);
  });

  it("sem canal de contato não é potencial lead; fechada zera o score", () => {
    const noContact = analyzeOpportunity({ ...base, phone: null, whatsapp: null }, null);
    expect(noContact.potential).toBe(false);
    expect(analyzeOpportunity({ ...base, status: "CLOSED_PERMANENTLY" }, null).score).toBe(0);
  });
});
