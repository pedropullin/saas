"use client";

import { useMemo } from "react";
import type { MapProps } from "./types";

const PAD = 9;

/**
 * Mapa esquemático: posiciona os pins pelas coordenadas relativas, sem base cartográfica.
 * Usado no modo demonstração ou quando não há chave de navegador do Google Maps.
 */
export function SchematicMap({ items, selectedId, reference, circle, onSelect, note }: MapProps & { note: string }) {
  const layout = useMemo(() => {
    const located = items.filter((item) => item.place.location);
    const coords = located.map((item) => item.place.location!);
    if (reference) coords.push(reference);
    if (circle) {
      const dLat = circle.radiusKm / 111;
      coords.push({ lat: circle.center.lat + dLat, lng: circle.center.lng }, { lat: circle.center.lat - dLat, lng: circle.center.lng });
    }
    if (!coords.length) return { pins: [], you: null, ring: null };
    const lats = coords.map((c) => c.lat);
    const lngs = coords.map((c) => c.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const spanLat = maxLat - minLat || 0.01;
    const spanLng = maxLng - minLng || 0.01;
    const project = (lat: number, lng: number) => ({
      left: PAD + ((lng - minLng) / spanLng) * (100 - PAD * 2),
      top: PAD + 4 + ((maxLat - lat) / spanLat) * (100 - PAD * 2 - 4),
    });
    const ring = circle ? { ...project(circle.center.lat, circle.center.lng), size: ((2 * circle.radiusKm) / 111 / spanLat) * (100 - PAD * 2 - 4) } : null;
    return {
      pins: located.map((item) => ({ ...item, ...project(item.place.location!.lat, item.place.location!.lng) })),
      you: reference ? project(reference.lat, reference.lng) : null,
      ring,
    };
  }, [items, reference, circle]);

  return (
    <div className="map-grid absolute inset-0 isolate overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-60">
        <div className="absolute inset-0 rounded-full border border-white/[0.04]" />
        <div className="absolute inset-[18%] rounded-full border border-white/[0.04]" />
        <div className="absolute inset-[36%] rounded-full border border-white/[0.05]" />
        <div className="animate-scan absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(229,9,20,0.14), transparent 22%)" }} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#050505_100%)]" />
      {layout.ring && (
        <span
          className="pointer-events-none absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/70 bg-brand/[0.06]"
          style={{ left: `${layout.ring.left}%`, top: `${layout.ring.top}%`, height: `${layout.ring.size}%` }}
        />
      )}
      {layout.you && <span className="you-dot" style={{ left: `${layout.you.left}%`, top: `${layout.you.top}%` }} />}
      {layout.pins.map(({ place, index, left, top }) => (
        <button
          key={place.id}
          type="button"
          className="pin"
          title={place.name}
          data-active={place.id === selectedId}
          data-saved={Boolean(place.saved.leadId || place.saved.favorite)}
          style={{ left: `${left}%`, top: `${top}%` }}
          onClick={() => onSelect(place.id)}
        >
          <span>{index}</span>
        </button>
      ))}
      <p className="pointer-events-none absolute bottom-3 left-3 max-w-[260px] rounded-lg bg-ink/80 px-2.5 py-1.5 text-[11px] text-mute backdrop-blur">{note}</p>
    </div>
  );
}
