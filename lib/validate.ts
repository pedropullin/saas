import type { SearchRequest } from "./types";

export type ValidationResult = { ok: true; value: SearchRequest } | { ok: false; error: string };

function isNumberInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

export function parseSearchRequest(input: unknown): ValidationResult {
  if (!input || typeof input !== "object") return { ok: false, error: "Requisição inválida." };
  const raw = input as Record<string, unknown>;

  const query = typeof raw.query === "string" ? raw.query.trim() : "";
  if (!query) return { ok: false, error: "Diga o que você procura (ex.: dentistas, barbearias, academias)." };
  if (query.length > 120) return { ok: false, error: "Busca muito longa (máx. 120 caracteres)." };

  const value: SearchRequest = { query };

  if (raw.location != null) {
    if (typeof raw.location !== "string" || raw.location.length > 200) {
      return { ok: false, error: "Local inválido." };
    }
    if (raw.location.trim()) value.location = raw.location.trim();
  }

  if (raw.near != null) {
    const near = raw.near as Record<string, unknown>;
    if (
      !isNumberInRange(near.lat, -90, 90) ||
      !isNumberInRange(near.lng, -180, 180) ||
      !isNumberInRange(near.radiusKm, 0.5, 50)
    ) {
      return { ok: false, error: "Localização inválida." };
    }
    value.near = { lat: near.lat, lng: near.lng, radiusKm: near.radiusKm };
  }

  if (raw.minRating != null && raw.minRating !== 0) {
    if (!isNumberInRange(raw.minRating, 0, 5) || (raw.minRating * 2) % 1 !== 0) {
      return { ok: false, error: "Nota mínima inválida." };
    }
    value.minRating = raw.minRating;
  }

  if (raw.openNow === true) value.openNow = true;

  if (raw.pageToken != null) {
    if (typeof raw.pageToken !== "string" || raw.pageToken.length > 4000) {
      return { ok: false, error: "Página inválida." };
    }
    value.pageToken = raw.pageToken;
  }

  return { ok: true, value };
}

export function isValidPlaceId(id: string): boolean {
  return /^[A-Za-z0-9_-]{8,300}$/.test(id);
}

/** Aceita só caminhos internos no ?next= do login. */
export function safeNextPath(next: string | null | undefined, fallback = "/prospectar"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
