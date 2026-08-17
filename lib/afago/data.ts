/**
 * Central source of truth for every real-world fact shown on the Afago site.
 *
 * Everything here was explicitly confirmed by the restaurant's
 * owner/representative as current and accurate. Nothing in this file is
 * invented — if a fact isn't confirmed (opening hours, specific dish names,
 * specific prices, guest reviews), it simply isn't included anywhere on the
 * site. See PlaceholderImage for the same rule applied to photography.
 */

export const AFAGO = {
  name: "Afago",
  fullName: "Afago Restaurante e Petiscaria",
  city: "Curitiba",
  state: "PR",
  neighborhood: "Atuba",
  addressLine1: "Av. Mal. Mascarenhas de Moraes, 2251",
  addressLine2: "Atuba — Curitiba, PR",
  addressFull: "Av. Mal. Mascarenhas de Moraes, 2251 — Atuba, Curitiba - PR",

  phoneDisplay: "(41) 3512-4866",
  /** E.164, used for tel: and wa.me links. */
  phoneE164: "554135124866",

  instagramHandle: "@afago.restaurante",
  instagramUrl: "https://www.instagram.com/afago.restaurante/",

  googleRating: 4.6,
  googleReviewCount: 259,
  pricePerPersonMin: 40,
  pricePerPersonMax: 60,

  mapsQuery: "Afago Restaurante e Petiscaria, Av. Mal. Mascarenhas de Moraes, 2251, Atuba, Curitiba - PR",
} as const;

export const whatsappUrl = (message: string) =>
  `https://wa.me/${AFAGO.phoneE164}?text=${encodeURIComponent(message)}`;

export const telUrl = `tel:+${AFAGO.phoneE164}`;

export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  AFAGO.mapsQuery
)}`;

export const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
  AFAGO.mapsQuery
)}&z=16&output=embed`;

/**
 * Menu categories are the general, verifiable concept areas of a
 * "restaurante e petiscaria" — not a transcription of a printed menu.
 * No specific dish names, descriptions or prices are stated anywhere,
 * because none were confirmed. The full, current menu lives on WhatsApp.
 */
export const MENU_CATEGORIES = [
  {
    id: "petiscos",
    title: "Petiscos",
    tagline: "Para começar, para compartilhar.",
  },
  {
    id: "grelhados",
    title: "Grelhados",
    tagline: "Na brasa, no ponto certo.",
  },
  {
    id: "pratos-da-casa",
    title: "Pratos da Casa",
    tagline: "Sabores que definem a casa.",
  },
  {
    id: "drinks",
    title: "Drinks",
    tagline: "Para brindar o momento.",
  },
] as const;
