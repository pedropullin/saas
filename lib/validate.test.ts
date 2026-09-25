import { describe, expect, it } from "vitest";
import { isValidPlaceId, parseSearchRequest, safeNextPath } from "./validate";

describe("parseSearchRequest", () => {
  it("aceita busca completa", () => {
    const result = parseSearchRequest({
      query: " dentistas ",
      location: "Recife",
      near: { lat: -8.05, lng: -34.9, radiusKm: 5 },
      minRating: 4.5,
      openNow: true,
      pageToken: "abc",
    });
    expect(result).toEqual({
      ok: true,
      value: {
        query: "dentistas",
        location: "Recife",
        near: { lat: -8.05, lng: -34.9, radiusKm: 5 },
        minRating: 4.5,
        openNow: true,
        pageToken: "abc",
      },
    });
  });

  it("recusa entradas inválidas", () => {
    expect(parseSearchRequest({ query: "" }).ok).toBe(false);
    expect(parseSearchRequest({ query: "x".repeat(121) }).ok).toBe(false);
    expect(parseSearchRequest({ query: "a", near: { lat: 200, lng: 0, radiusKm: 5 } }).ok).toBe(false);
    expect(parseSearchRequest({ query: "a", minRating: 4.3 }).ok).toBe(false);
    expect(parseSearchRequest(null).ok).toBe(false);
  });
});

describe("helpers", () => {
  it("valida id de lugar", () => {
    expect(isValidPlaceId("ChIJN1t_tDeuEmsRUsoyG83frY4")).toBe(true);
    expect(isValidPlaceId("../../etc")).toBe(false);
  });

  it("só aceita next interno", () => {
    expect(safeNextPath("/lista")).toBe("/lista");
    expect(safeNextPath("//evil.com")).toBe("/prospectar");
    expect(safeNextPath("https://evil.com")).toBe("/prospectar");
    expect(safeNextPath(undefined)).toBe("/prospectar");
  });
});
