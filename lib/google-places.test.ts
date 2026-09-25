import { afterEach, describe, expect, it, vi } from "vitest";
import { buildTextQuery, mapDetails, mapPlace, PlacesError, searchPlaces } from "./google-places";

afterEach(() => vi.unstubAllGlobals());

describe("mapPlace", () => {
  it("converte a resposta da Places API (New)", () => {
    const place = mapPlace({
      id: "ChIJ123456789",
      displayName: { text: "Clínica Sorriso" },
      formattedAddress: "Rua A, 10 - Boa Viagem, Recife - PE, Brasil",
      addressComponents: [
        { longText: "Recife", shortText: "Recife", types: ["administrative_area_level_2", "political"] },
        { longText: "Brasil", shortText: "BR", types: ["country", "political"] },
      ],
      location: { latitude: -8.1, longitude: -34.9 },
      rating: 4.7,
      userRatingCount: 210,
      internationalPhoneNumber: "+55 81 99876-5432",
      nationalPhoneNumber: "(81) 99876-5432",
      websiteUri: "https://instagram.com/clinicasorriso",
      googleMapsUri: "https://maps.google.com/?cid=1",
      businessStatus: "OPERATIONAL",
      priceLevel: "PRICE_LEVEL_MODERATE",
      primaryTypeDisplayName: { text: "Dentista" },
      currentOpeningHours: { openNow: true },
    });

    expect(place).toMatchObject({
      id: "ChIJ123456789",
      name: "Clínica Sorriso",
      category: "Dentista",
      city: "Recife",
      location: { lat: -8.1, lng: -34.9 },
      rating: 4.7,
      reviewCount: 210,
      website: null,
      social: "https://instagram.com/clinicasorriso",
      openNow: true,
      priceLevel: 2,
      status: "OPERATIONAL",
    });
    expect(place.phone?.kind).toBe("celular");
    expect(place.whatsapp).toMatchObject({ confidence: "provavel", number: "5581998765432" });
  });

  it("tolera campos ausentes", () => {
    const place = mapPlace({ id: "ChIJabcdefgh" });
    expect(place).toMatchObject({ name: "Sem nome", rating: null, reviewCount: 0, phone: null, whatsapp: null });
  });

  it("mapeia avaliações nos detalhes", () => {
    const details = mapDetails({
      id: "ChIJabcdefgh",
      reviews: [{ rating: 5, text: { text: "Ótimo" }, authorAttribution: { displayName: "Maria" }, relativePublishTimeDescription: "há 2 dias" }],
      regularOpeningHours: { weekdayDescriptions: ["segunda-feira: 08:00–18:00"] },
    });
    expect(details.reviews).toEqual([{ author: "Maria", rating: 5, text: "Ótimo", when: "há 2 dias" }]);
    expect(details.hours).toEqual(["segunda-feira: 08:00–18:00"]);
  });
});

describe("buildTextQuery", () => {
  it("junta o que e onde", () => {
    expect(buildTextQuery("dentistas", "Recife")).toBe("dentistas em Recife");
    expect(buildTextQuery(" dentistas ", " ")).toBe("dentistas");
  });
});

describe("searchPlaces", () => {
  it("envia a busca certa e devolve a próxima página", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ places: [{ id: "ChIJabcdefgh", displayName: { text: "A" } }], nextPageToken: "p2" }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchPlaces(
      { query: "dentistas", location: "Recife", near: { lat: -8, lng: -35, radiusKm: 80 }, minRating: 4 },
      "KEY",
    );

    expect(result).toMatchObject({ nextPageToken: "p2", demo: false, places: [{ id: "ChIJabcdefgh", name: "A" }] });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://places.googleapis.com/v1/places:searchText");
    const headers = init.headers as Record<string, string>;
    expect(headers["X-Goog-Api-Key"]).toBe("KEY");
    expect(headers["X-Goog-FieldMask"]).toContain("places.internationalPhoneNumber");
    expect(headers["X-Goog-FieldMask"]).toContain("nextPageToken");
    expect(JSON.parse(init.body as string)).toEqual({
      textQuery: "dentistas em Recife",
      languageCode: "pt-BR",
      pageSize: 20,
      locationBias: { circle: { center: { latitude: -8, longitude: -35 }, radius: 50000 } },
      minRating: 4,
    });
  });

  it("traduz chave inválida", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({ error: { code: 400, status: "INVALID_ARGUMENT", message: "API key not valid.", details: [{ reason: "API_KEY_INVALID" }] } }),
          { status: 400 },
        ),
      ),
    );
    await expect(searchPlaces({ query: "x" }, "bad")).rejects.toThrow(PlacesError);
    await expect(searchPlaces({ query: "x" }, "bad")).rejects.toThrow(/GOOGLE_MAPS_API_KEY/);
  });

  it("traduz cota estourada", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: { status: "RESOURCE_EXHAUSTED" } }), { status: 429 })));
    await expect(searchPlaces({ query: "x" }, "k")).rejects.toMatchObject({ status: 429 });
  });
});
