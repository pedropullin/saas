"use client";

import { useMemo } from "react";
import type { MapProps } from "./types";

const PAD = 9; // % de margem

/**
 * Mapa esquemático: posiciona os pins pelas coordenadas relativas, sem base cartográfica.
 * Usado no modo demonstração ou quando não há chave de navegador do Google Maps.
 */
export function SchematicMap({ items, selectedId, savedIds, near, onSelect, note }: MapProps & { note: string }) {
  const points = useMemo(() => {
    const located = items.filter((item) => item.place.location);
    const coords = located.map((item) => item.place.location!);
    if (near) coords.push(near);
    if (!coords.length) return { pins: [], you: null };

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

    return {
      pins: located.map((item) => ({ ...item, ...project(item.place.location!.lat, item.place.location!.lng) })),
      you: near ? project(near.lat, near.lng) : null,
    };
  }, [items, near]);

  return (
    <div className="map-grid absolute inset-0 isolate overflow-hidden">
      {/* Radar decorativo */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-60">
        <div className="absolute inset-0 rounded-full border border-white/[0.04]" />
        <div className="absolute inset-[18%] rounded-full border border-white/[0.04]" />
        <div className="absolute inset-[36%] rounded-full border border-white/[0.05]" />
        <div
          className="animate-scan absolute inset-0 rounded-full"
          style={{ background: "conic-gradient(from 0deg, rgba(255,46,46,0.14), transparent 22%)" }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#070707_100%)]" />

      {points.you && <span className="you-dot" style={{ left: `${points.you.left}%`, top: `${points.you.top}%` }} />}

      {points.pins.map(({ place, index, left, top }) => (
        <button
          key={place.id}
          type="button"
          className="pin"
          title={place.name}
          data-active={place.id === selectedId}
          data-saved={savedIds.has(place.id)}
          style={{ left: `${left}%`, top: `${top}%` }}
          onClick={() => onSelect(place.id)}
        >
          <span>{index}</span>
        </button>
      ))}

      <p className="absolute bottom-3 left-3 right-3 text-[11px] text-mute md:right-auto md:max-w-sm">{note}</p>
    </div>
  );
}
