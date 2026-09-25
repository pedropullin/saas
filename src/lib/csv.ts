import { contactFacts, hasFact } from "./contact";
import type { Enrichment, Place } from "./types";
import { CONFIDENCE_LABEL } from "./whatsapp";

type Cell = string | number | null | undefined;

function escapeCell(value: Cell): string {
  const text = value == null ? "" : String(value);
  // Evita fórmula injetada ao abrir no Excel/Sheets.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[";\n\r,]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(rows: Cell[][]): string {
  return rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
}

export const PLACE_CSV_HEADER = [
  "Empresa",
  "Segmento",
  "Endereço",
  "Bairro",
  "Cidade",
  "Estado",
  "País",
  "CEP",
  "Telefone",
  "WhatsApp",
  "Situação WhatsApp",
  "Site",
  "Instagram",
  "Facebook",
  "E-mail",
  "Nota",
  "Avaliações",
  "Google Maps",
];

const NOT_FOUND = "Não encontrado";

export function placeCsvRow(place: Place, enrichment?: Enrichment | null): Cell[] {
  const facts = contactFacts(place, enrichment);
  const value = <T,>(fact: { state: string; value?: T }, map: (v: T) => Cell = (v) => v as Cell) =>
    hasFact(fact as never) ? map((fact as { value: T }).value) : NOT_FOUND;
  return [
    place.name,
    place.category,
    place.address,
    place.neighborhood,
    place.city,
    place.state,
    place.country,
    place.postalCode,
    value(facts.phone),
    hasFact(facts.whatsapp) ? (facts.whatsapp.value.number ? `+${facts.whatsapp.value.number}` : facts.whatsapp.value.link) : NOT_FOUND,
    hasFact(facts.whatsapp) ? CONFIDENCE_LABEL[facts.whatsapp.value.confidence] : NOT_FOUND,
    value(facts.website),
    value(facts.instagram),
    value(facts.facebook),
    value(facts.email),
    place.rating ?? NOT_FOUND,
    place.reviewCount ?? NOT_FOUND,
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

/** Lê CSV (vírgula ou ponto e vírgula, aspas, quebras de linha em campos). */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i]!;
    if (quoted) {
      if (char === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === delimiter) {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}
