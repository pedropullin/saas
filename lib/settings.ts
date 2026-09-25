import { createLocalStore } from "./local-store";
import { DEFAULT_TEMPLATES, type MessageTemplate } from "./whatsapp";

export interface Settings {
  myName: string;
  templates: MessageTemplate[];
  activeTemplateId: string;
}

const DEFAULT_SETTINGS: Settings = {
  myName: "",
  templates: DEFAULT_TEMPLATES,
  activeTemplateId: DEFAULT_TEMPLATES[0]!.id,
};

function sanitize(value: unknown): Settings {
  if (!value || typeof value !== "object") return DEFAULT_SETTINGS;
  const raw = value as Partial<Settings>;
  const templates = Array.isArray(raw.templates)
    ? raw.templates.filter((t) => t && typeof t.id === "string" && typeof t.body === "string")
    : DEFAULT_TEMPLATES;
  const safeTemplates = templates.length ? templates : DEFAULT_TEMPLATES;
  return {
    myName: typeof raw.myName === "string" ? raw.myName : "",
    templates: safeTemplates,
    activeTemplateId: safeTemplates.some((t) => t.id === raw.activeTemplateId)
      ? raw.activeTemplateId!
      : safeTemplates[0]!.id,
  };
}

const store = createLocalStore<Settings>("prospecta:settings:v1", DEFAULT_SETTINGS, sanitize);

export const useSettings = store.useValue;
export const setSettings = store.set;

export function activeTemplate(settings: Settings): MessageTemplate {
  return settings.templates.find((t) => t.id === settings.activeTemplateId) ?? settings.templates[0]!;
}
