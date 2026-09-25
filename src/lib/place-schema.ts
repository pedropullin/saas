import { z } from "zod";
import type { Place } from "./types";

const str = (max: number) => z.string().max(max);
const nstr = (max: number) => z.string().max(max).nullable();
const url = nstr(2000);

/** Validação de um Place enviado pelo navegador antes de salvar no banco. */
export const placeSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{8,600}$/),
  name: str(300),
  category: nstr(120),
  types: z.array(str(80)).max(40).default([]),
  address: nstr(400),
  neighborhood: nstr(120),
  city: nstr(120),
  state: nstr(80),
  country: nstr(80),
  postalCode: nstr(20),
  location: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).nullable(),
  rating: z.number().min(0).max(5).nullable(),
  reviewCount: z.number().int().min(0).nullable(),
  phone: z
    .object({
      national: str(40),
      international: str(40),
      e164: z.string().regex(/^\+\d{6,16}$/),
      kind: z.enum(["celular", "fixo", "fixo_ou_celular", "outro"]),
      country: nstr(4),
    })
    .nullable(),
  whatsapp: z
    .object({
      number: z.string().regex(/^\d{8,16}$/).nullable(),
      link: url,
      confidence: z.enum(["confirmado", "provavel", "possivel"]),
      source: z.enum(["link", "telefone", "site"]),
    })
    .nullable(),
  website: url,
  instagram: url,
  facebook: url,
  mapsUrl: url,
  openNow: z.boolean().nullable(),
  hours: z.array(str(120)).max(7).default([]),
  status: z.enum(["OPERATIONAL", "CLOSED_TEMPORARILY", "CLOSED_PERMANENTLY"]).nullable(),
  priceLevel: z.number().int().min(0).max(4).nullable(),
  photos: z
    .array(
      z.object({
        name: z.string().regex(/^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/),
        width: z.number().nullable(),
        height: z.number().nullable(),
        attributions: z.array(z.object({ name: str(200), uri: url })).max(5),
      }),
    )
    .max(10)
    .default([]),
  demo: z.boolean().optional(),
}) satisfies z.ZodType<Place, unknown>;

export function parsePlace(input: unknown): Place {
  return placeSchema.parse(input) as Place;
}
