import type { Place, PlaceDetails } from "./types";

/** Detalhes fictícios para empresas do modo demonstração (sem chamar o Google). */
const DEMO_REVIEWS = [
  "Atendimento rápido e muito educado. Voltarei com certeza.",
  "Bom custo-benefício, mas o horário de pico é bem cheio.",
  "Equipe atenciosa, ambiente limpo e organizado.",
  "Demorou um pouco para responder no WhatsApp, mas resolveram tudo.",
];

export function demoDetails(place: Place): PlaceDetails {
  let seed = 0;
  for (const char of place.id) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  return {
    ...place,
    hours: [
      "segunda-feira: 09:00–18:00",
      "terça-feira: 09:00–18:00",
      "quarta-feira: 09:00–18:00",
      "quinta-feira: 09:00–18:00",
      "sexta-feira: 09:00–18:00",
      "sábado: 09:00–13:00",
      "domingo: Fechado",
    ],
    reviews: DEMO_REVIEWS.slice(0, 3).map((text, i) => ({
      author: `Cliente exemplo ${i + 1}`,
      rating: 3 + ((seed >> i) % 3),
      text,
      when: `há ${i + 1} semana${i ? "s" : ""}`,
    })),
    summary: "Empresa fictícia do modo demonstração.",
  };
}
