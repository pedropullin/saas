import { describe, expect, it } from "vitest";
import { applyFilters, DEFAULT_FILTERS, mergePlaces, splitLocations } from "./filters";
import type { Place } from "./types";

function make(id: string, patch: Partial<Place> = {}): Place {
  return {
    id,
    name: id,
    category: null,
    address: null,
    city: null,
    location: null,
    rating: 4,
    reviewCount: 10,
    phone: null,
    whatsapp: null,
    website: null,
    social: null,
    mapsUrl: null,
    openNow: null,
    status: "OPERATIONAL",
    priceLevel: null,
    ...patch,
  };
}

const wa = (confidence: "confirmado" | "provavel" | "possivel") => ({ number: "1", link: null, confidence, source: "telefone" as const });

describe("applyFilters", () => {
  const places = [
    make("a", { rating: 4.9, reviewCount: 500, whatsapp: wa("provavel"), website: "https://a.com" }),
    make("b", { rating: 3.2, reviewCount: 5, whatsapp: wa("possivel") }),
    make("c", { rating: 4.5, reviewCount: 80, status: "CLOSED_PERMANENTLY" }),
    make("d", { rating: null, reviewCount: 0, whatsapp: wa("confirmado"), openNow: true }),
  ];
  const ids = (list: Place[]) => list.map((p) => p.id);

  it("esconde fechadas permanentemente por padrão", () => {
    expect(ids(applyFilters(places, DEFAULT_FILTERS, "relevancia"))).toEqual(["a", "b", "d"]);
  });

  it("filtra WhatsApp provável/confirmado, sem site e nota", () => {
    expect(ids(applyFilters(places, { ...DEFAULT_FILTERS, onlyWhatsApp: true }, "relevancia"))).toEqual(["a", "d"]);
    expect(ids(applyFilters(places, { ...DEFAULT_FILTERS, website: "sem" }, "relevancia"))).toEqual(["b", "d"]);
    expect(ids(applyFilters(places, { ...DEFAULT_FILTERS, minRating: 4 }, "relevancia"))).toEqual(["a"]);
    expect(ids(applyFilters(places, { ...DEFAULT_FILTERS, openNow: true }, "relevancia"))).toEqual(["d"]);
  });

  it("ordena por nota e por avaliações", () => {
    expect(ids(applyFilters(places, DEFAULT_FILTERS, "nota"))).toEqual(["a", "b", "d"]);
    expect(ids(applyFilters(places, { ...DEFAULT_FILTERS, hideClosed: false }, "avaliacoes"))).toEqual(["a", "c", "b", "d"]);
  });
});

describe("mergePlaces e splitLocations", () => {
  it("não duplica empresas", () => {
    expect(mergePlaces([make("a")], [make("a"), make("b")]).map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("separa regiões por ponto e vírgula, mantendo a vírgula do endereço", () => {
    expect(splitLocations("Pinheiros, São Paulo; Moema, São Paulo ;")).toEqual(["Pinheiros, São Paulo", "Moema, São Paulo"]);
    expect(splitLocations("  ")).toEqual([]);
  });
});
