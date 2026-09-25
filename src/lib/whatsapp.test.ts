import { describe, expect, it } from "vitest";
import type { Place } from "./types";
import { fillTemplate, whatsappUrl } from "./whatsapp";

const place: Place = {
  id: "x",
  name: "Barbearia do Zé",
  category: "Barbearia",
  types: [],
  address: null,
  neighborhood: null,
  city: "Recife",
  state: null,
  country: null,
  postalCode: null,
  location: null,
  rating: 4.75,
  reviewCount: 1234,
  phone: null,
  whatsapp: null,
  website: null,
  instagram: null,
  facebook: null,
  mapsUrl: null,
  openNow: null,
  hours: [],
  photos: [],
  status: null,
  priceLevel: null,
};

describe("fillTemplate", () => {
  it("troca as variáveis conhecidas", () => {
    const text = fillTemplate("Oi {empresa} ({categoria}, {cidade}) nota {nota} com {avaliacoes}. Sou {meu_nome}.", place, "Ana");
    expect(text).toBe("Oi Barbearia do Zé (barbearia, Recife) nota 4,8 com 1.234. Sou Ana.");
  });

  it("mantém variáveis desconhecidas", () => {
    expect(fillTemplate("Olá {xyz}", place, "Ana")).toBe("Olá {xyz}");
  });
});

describe("whatsappUrl", () => {
  it("monta wa.me com texto codificado", () => {
    const url = whatsappUrl({ number: "5511987654321", link: null, confidence: "provavel", source: "telefone" }, "Olá & tchau");
    expect(url).toBe("https://wa.me/5511987654321?text=Ol%C3%A1%20%26%20tchau");
  });

  it("usa o link curto quando não há número", () => {
    expect(whatsappUrl({ number: null, link: "https://wa.link/abc", confidence: "confirmado", source: "link" }, "oi")).toBe(
      "https://wa.link/abc",
    );
  });
});
