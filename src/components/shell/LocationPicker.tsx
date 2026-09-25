"use client";

import { Crosshair, GlobeHemisphereWest, MapPin, SpinnerGap } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "@/client/toast";
import { buttonClass } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Popover } from "@/components/ui/Popover";
import { cn } from "@/lib/utils";
import { useApp } from "./AppContext";

/** "Localização atual": ponto de referência para distância e buscas perto de você. */
export function LocationPicker({ className }: { className?: string }) {
  const { prefs, setPrefs } = useApp();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<"gps" | "text" | null>(null);

  function pickGps(close: () => void) {
    if (!("geolocation" in navigator)) return toast.error("Seu navegador não permite pegar a localização.");
    setBusy("gps");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await setPrefs({ location: { label: "Minha localização", lat: pos.coords.latitude, lng: pos.coords.longitude } });
        setBusy(null);
        close();
        toast.success("Localização atual definida.");
      },
      () => {
        setBusy(null);
        toast.error("Não foi possível pegar sua localização. Digite uma cidade.");
      },
      { timeout: 10_000, maximumAge: 300_000 },
    );
  }

  async function pickText(close: () => void) {
    if (text.trim().length < 2) return;
    setBusy("text");
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(text.trim())}`).catch(() => null);
    const data = await response?.json().catch(() => null);
    setBusy(null);
    if (!response?.ok) return toast.error(data?.error ?? "Local não encontrado.");
    await setPrefs({ location: { label: data.label, lat: data.center.lat, lng: data.center.lng } });
    setText("");
    close();
    toast.success(`Localização atual: ${data.label}`);
  }

  return (
    <Popover
      align="start"
      className="w-[320px]"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className={cn("flex h-10 max-w-[220px] items-center gap-2 rounded-xl border border-line-2 bg-ink-3 px-3 text-sm text-mute-2 transition-colors hover:border-white/30 hover:text-paper", className)}
        >
          {prefs.location ? <MapPin size={16} weight="fill" className="shrink-0 text-brand" /> : <GlobeHemisphereWest size={16} className="shrink-0" />}
          <span className="truncate">{prefs.location?.label ?? "Mundial"}</span>
        </button>
      )}
    >
      {(close) => (
        <div className="p-4">
          <p className="text-sm font-semibold">Localização atual</p>
          <p className="mt-1 text-xs text-mute">Usada para calcular distância e para buscas sem cidade definida.</p>
          <button type="button" onClick={() => pickGps(close)} disabled={busy !== null} className={buttonClass("subtle", "md", "mt-4 w-full justify-start")}>
            {busy === "gps" ? <SpinnerGap size={16} className="animate-spin" /> : <Crosshair size={16} />} Usar minha localização
          </button>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void pickText(close);
            }}
          >
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Cidade, bairro ou CEP" aria-label="Definir localização" />
            <button type="submit" disabled={busy !== null} className={buttonClass("primary", "icon")} aria-label="Definir">
              {busy === "text" ? <SpinnerGap size={16} className="animate-spin" /> : <MapPin size={16} />}
            </button>
          </form>
          {prefs.location && (
            <button
              type="button"
              onClick={async () => {
                await setPrefs({ location: null });
                close();
              }}
              className={buttonClass("ghost", "sm", "mt-2 w-full")}
            >
              <GlobeHemisphereWest size={15} /> Usar busca mundial
            </button>
          )}
        </div>
      )}
    </Popover>
  );
}
