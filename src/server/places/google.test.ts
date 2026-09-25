import { afterEach, describe, expect, it, vi } from "vitest";
import { buildSearchBody, createGoogleProvider, mapDetails, mapPlace } from "./google";
import { PlacesError } from "./provider";

afterEach(() => vi.unstubAllGlobals());

describe("mapPlace", () => {
  it("converte a resposta da Places API (New)", () => {
    const place = mapPlace({
      id: "ChIJ123456789",
      displayName: { text: "Clínica Sorriso" },
      formattedAddress: "Rua A, 10 - Boa Viagem, Recife - PE, 51020-000, Brasil",
      addressComponents: [
        { longText: "Boa Viagem", shortText: "Boa Viagem", types: ["sublocality_level_1", "sublocality"] },
        { longText: "Recife", shortText: "Recife", types: ["administrative_area_level_2"] },
        { longText: "Pernambuco", shortText: "PE", types: ["administrative_area_level_1"] },
        { longText: "Brasil", shortText: "BR", types: ["country"] },
        { longText: "51020-000", shortText: "51020-000", types: ["postal_code"] },
      ],
      location: { latitude: -8.1, longitude: -34.9 },
      rating: 4.7,
      userRatingCount: 210,
      internationalPhoneNumber: "+55 81 99876-5432",
      websiteUri: "https://instagram.com/clinicasorriso",
      googleMapsUri: "https://maps.google.com/?cid=1",
      businessStatus: "OPERATIONAL",
      priceLevel: "PRICE_LEVEL_MODERATE",
      primaryTypeDisplayName: { text: "Dentista" },
      currentOpeningHours: { openNow: true, weekdayDescriptions: ["segunda-feira: 08:00–18:00"] },
      photos: [{ name: "places/ChIJ123456789/photos/AbC", widthPx: 800, heightPx: 600, authorAttributions: [{ displayName: "Fulano", uri: "https://maps.google.com/u" }] }],
    });

    expect(place).toMatchObject({
      name: "Clínica Sorriso",
      category: "Dentista",
      neighborhood: "Boa Viagem",
      city: "Recife",
      state: "PE",
      country: "Brasil",
      postalCode: "51020-000",
      rating: 4.7,
      reviewCount: 210,
      website: null,
      instagram: "https://instagram.com/clinicasorriso",
      openNow: true,
      hours: ["segunda-feira: 08:00–18:00"],
      priceLevel: 2,
      photos: [{ name: "places/ChIJ123456789/photos/AbC", attributions: [{ name: "Fulano" }] }],
    });
    expect(place.whatsapp).toMatchObject({ confidence: "provavel", number: "5581998765432" });
  });

  it("não inventa dado ausente", () => {
    const place = mapPlace({ id: "ChIJabcdefgh" });
    expect(place).toMatchObject({ rating: null, reviewCount: null, phone: null, whatsapp: null, website: null, photos: [] });
  });

  it("mapeia avaliações e horário nos detalhes", () => {
    const details = mapDetails({
      id: "ChIJabcdefgh",
      reviews: [{ rating: 5, text: { text: "Ótimo" }, authorAttribution: { displayName: "Maria", uri: "https://g.co/m" }, relativePublishTimeDescription: "há 2 dias" }],
      regularOpeningHours: { weekdayDescriptions: ["segunda-feira: 08:00–18:00"] },
      editorialSummary: { text: "Clínica de bairro." },
    });
    expect(details.reviews).toEqual([{ author: "Maria", authorUri: "https://g.co/m", rating: 5, text: "Ótimo", when: "há 2 dias" }]);
    expect(details.summary).toBe("Clínica de bairro.");
  });
});

describe("buildSearchBody", () => {
  it("usa restrição por retângulo quando há área, e viés por círculo quando não há", () => {
    const rect = { low: { lat: -1, lng: -2 }, high: { lat: 1, lng: 2 } };
    expect(buildSearchBody({ textQuery: "x", restriction: rect, bias: { center: { lat: 0, lng: 0 }, radiusKm: 5 } })).toMatchObject({
      locationRestriction: { rectangle: { low: { latitude: -1, longitude: -2 }, high: { latitude: 1, longitude: 2 } } },
    });
    const body = buildSearchBody({ textQuery: "x", bias: { center: { lat: 1, lng: 2 }, radiusKm: 80 }, regionCode: "BR", minRating: 4.3 });
    expect(body).toMatchObject({ locationBias: { circle: { center: { latitude: 1, longitude: 2 }, radius: 50000 } }, regionCode: "br", minRating: 4 });
    expect(body.locationRestriction).toBeUndefined();
  });
});

describe("createGoogleProvider", () => {
  it("envia chave e máscara de campos, e devolve o token da próxima página", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ places: [{ id: "ChIJabcdefgh" }], nextPageToken: "p2" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await createGoogleProvider("KEY").search({ textQuery: "dentistas em Recife" });
    expect(result.nextPageToken).toBe("p2");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://places.googleapis.com/v1/places:searchText");
    const headers = init.headers as Record<string, string>;
    expect(headers["X-Goog-Api-Key"]).toBe("KEY");
    expect(headers["X-Goog-FieldMask"]).toContain("places.photos");
  });

  it("traduz erros do Google", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: { status: "INVALID_ARGUMENT", details: [{ reason: "API_KEY_INVALID" }] } }), { status: 400 })),
    );
    await expect(createGoogleProvider("bad").search({ textQuery: "x" })).rejects.toThrow(PlacesError);
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: { status: "RESOURCE_EXHAUSTED" } }), { status: 429 })));
    await expect(createGoogleProvider("k").search({ textQuery: "x" })).rejects.toMatchObject({ status: 429 });
  });
});
