"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { MapProps } from "./types";

const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0b0b0b" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7d7d7d" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b0b0b" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#2a2a2a" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#101010" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1d1d1d" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0f0f0f" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#666666" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#040404" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3a3a3a" }] },
];

let loader: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window !== "undefined" && typeof window.google?.maps?.importLibrary === "function") return Promise.resolve();
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    const callback = "__prospectaMapsReady";
    (window as unknown as Record<string, () => void>)[callback] = () => resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&language=pt-BR&loading=async&callback=${callback}`;
    script.async = true;
    script.onerror = () => {
      loader = null;
      reject(new Error("Não foi possível carregar o Google Maps."));
    };
    document.head.appendChild(script);
  });
  return loader;
}

interface PinOverlay extends google.maps.OverlayView {
  setState(active: boolean, saved: boolean): void;
  position: google.maps.LatLngLiteral;
}

type PinFactory = (position: google.maps.LatLngLiteral, label: string, title: string, onClick: () => void) => PinOverlay;

/** Pins em HTML via OverlayView: visual próprio sem depender de Map ID. */
function createPinFactory(OverlayView: typeof google.maps.OverlayView): PinFactory {
  class Pin extends OverlayView implements PinOverlay {
    element: HTMLButtonElement;
    position: google.maps.LatLngLiteral;

    constructor(position: google.maps.LatLngLiteral, label: string, title: string, onClick: () => void) {
      super();
      this.position = position;
      this.element = document.createElement("button");
      this.element.type = "button";
      this.element.className = "pin";
      this.element.title = title;
      const span = document.createElement("span");
      span.textContent = label;
      this.element.appendChild(span);
      this.element.addEventListener("click", (event) => {
        event.stopPropagation();
        onClick();
      });
      OverlayView.preventMapHitsAndGesturesFrom(this.element);
    }

    onAdd() {
      this.getPanes()?.overlayMouseTarget.appendChild(this.element);
    }

    draw() {
      const point = this.getProjection()?.fromLatLngToDivPixel(this.position);
      if (!point) return;
      this.element.style.left = `${point.x}px`;
      this.element.style.top = `${point.y}px`;
    }

    onRemove() {
      this.element.remove();
    }

    setState(active: boolean, saved: boolean) {
      this.element.dataset.active = String(active);
      this.element.dataset.saved = String(saved);
    }
  }
  return (...args) => new Pin(...args);
}

export default function GoogleMapView({ apiKey, items, selectedId, reference, circle, onSelect }: MapProps & { apiKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const factoryRef = useRef<PinFactory | null>(null);
  const pinsRef = useRef<Map<string, PinOverlay>>(new Map());
  const youRef = useRef<google.maps.Circle | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const select = useEffectEvent((id: string) => onSelect(id));

  useEffect(() => {
    let cancelled = false;
    (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () =>
      setError("A chave de navegador do Google Maps foi recusada. Confira GOOGLE_MAPS_BROWSER_KEY e as restrições de domínio.");

    loadGoogleMaps(apiKey)
      .then(async () => {
        const { Map, OverlayView } = (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary;
        if (cancelled || !containerRef.current) return;
        mapRef.current = new Map(containerRef.current, {
          center: { lat: -23.5614, lng: -46.6559 },
          zoom: 12,
          styles: DARK_STYLE,
          backgroundColor: "#0a0a0a",
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: "greedy",
        });
        factoryRef.current = createPinFactory(OverlayView);
        setReady(true);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  // Recria os pins quando a lista muda e enquadra todos no mapa.
  useEffect(() => {
    const map = mapRef.current;
    const factory = factoryRef.current;
    if (!ready || !map || !factory) return;

    const pins = pinsRef.current;
    pins.forEach((pin) => pin.setMap(null));
    pins.clear();

    const bounds = new google.maps.LatLngBounds();
    for (const { place, index } of items) {
      if (!place.location) continue;
      const pin = factory(place.location, String(index), place.name, () => select(place.id));
      pin.setMap(map);
      pins.set(place.id, pin);
      bounds.extend(place.location);
    }

    youRef.current?.setMap(null);
    if (reference) {
      youRef.current = new google.maps.Circle({
        map,
        center: reference,
        radius: 60,
        fillColor: "#ffffff",
        fillOpacity: 1,
        strokeColor: "#e50914",
        strokeWeight: 3,
        clickable: false,
      });
      if (!pins.size) bounds.extend(reference);
    }

    circleRef.current?.setMap(null);
    if (circle) {
      circleRef.current = new google.maps.Circle({
        map,
        center: circle.center,
        radius: circle.radiusKm * 1000,
        fillColor: "#e50914",
        fillOpacity: 0.06,
        strokeColor: "#e50914",
        strokeOpacity: 0.7,
        strokeWeight: 1.5,
        clickable: false,
      });
      const b = circleRef.current.getBounds();
      if (b) bounds.union(b);
    }

    if (!bounds.isEmpty()) {
      if (pins.size === 1 && !circle) {
        map.setCenter(bounds.getCenter());
        map.setZoom(15);
      } else {
        map.fitBounds(bounds, 56);
      }
    }
  }, [items, reference, circle, ready]);

  // Destaca o pin selecionado e os já salvos.
  useEffect(() => {
    if (!ready) return;
    const saved = new Set(items.filter((i) => i.place.saved.leadId || i.place.saved.favorite).map((i) => i.place.id));
    pinsRef.current.forEach((pin, id) => pin.setState(id === selectedId, saved.has(id)));
    const selected = selectedId ? pinsRef.current.get(selectedId) : null;
    const map = mapRef.current;
    if (selected && map && !map.getBounds()?.contains(selected.position)) map.panTo(selected.position);
  }, [selectedId, ready, items]);

  return (
    <div className="absolute inset-0 bg-[#0a0a0a]">
      <div ref={containerRef} className="absolute inset-0" />
      {!ready && !error && (
        <div className="absolute inset-0 grid place-items-center text-sm text-mute">Carregando Google Maps…</div>
      )}
      {error && (
        <div className="absolute inset-x-4 top-4 rounded-xl border border-brand/50 bg-ink/95 p-4 text-sm text-paper">{error}</div>
      )}
    </div>
  );
}
