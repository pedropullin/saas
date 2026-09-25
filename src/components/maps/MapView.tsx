"use client";

import dynamic from "next/dynamic";
import { useApp } from "@/components/shell/AppContext";
import { SchematicMap } from "./SchematicMap";
import type { MapProps } from "./types";

const GoogleMapView = dynamic(() => import("./GoogleMapView"), {
  ssr: false,
  loading: () => <div className="map-grid absolute inset-0" />,
});

/** Google Maps quando há chave de navegador; senão, mapa esquemático. */
export function MapView(props: MapProps) {
  const { mapsKey, demo } = useApp();
  if (mapsKey && !demo) return <GoogleMapView apiKey={mapsKey} {...props} />;
  return (
    <SchematicMap
      {...props}
      note={
        demo
          ? "Mapa esquemático do modo demonstração: posições fictícias."
          : "Mapa esquemático. Configure GOOGLE_MAPS_BROWSER_KEY para ver o Google Maps."
      }
    />
  );
}
