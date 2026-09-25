import { CONFIDENCE_LABEL } from "./whatsapp";
import type { Place } from "./types";

function escapeCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  // Evita fórmula injetada ao abrir no Excel/Sheets.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[";\n\r,]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(rows: Array<Array<string | number | null | undefined>>): string {
  return rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
}

export const PLACE_CSV_HEADER = [
  "Empresa",
  "Segmento",
  "Endereço",
  "Cidade",
  "Telefone",
  "WhatsApp",
  "Situação WhatsApp",
  "Nota",
  "Avaliações",
  "Site",
  "Rede social",
  "Google Maps",
];

export function placeCsvRow(place: Place): Array<string | number | null> {
  return [
    place.name,
    place.category,
    place.address,
    place.city,
    place.phone?.international ?? null,
    place.whatsapp?.number ? `+${place.whatsapp.number}` : (place.whatsapp?.link ?? null),
    place.whatsapp ? CONFIDENCE_LABEL[place.whatsapp.confidence] : "Sem telefone",
    place.rating,
    place.reviewCount,
    place.website,
    place.social,
    place.mapsUrl,
  ];
}

/** Dispara o download no navegador (BOM para acentos no Excel). */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
