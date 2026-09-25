import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { Enrichment, Place } from "@/lib/types";
import type { LeadStatus } from "@/lib/leads";
import type { PlanId } from "@/lib/plans";
import type { MessageTemplate } from "@/lib/whatsapp";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/* ───────────── Autenticação e organizações ───────────── */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  title: text("title"),
  createdAt: createdAt(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  plan: text("plan").$type<PlanId>().notNull().default("free"),
  planUpdatedAt: timestamp("plan_updated_at", { withTimezone: true }),
  billingCustomerId: text("billing_customer_id"),
  createdAt: createdAt(),
});

export type Role = "owner" | "admin" | "member";

export const memberships = pgTable(
  "memberships",
  {
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").$type<Role>().notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.orgId, t.userId] }), index("memberships_user_idx").on(t.userId)],
);

export const sessions = pgTable(
  "sessions",
  {
    /** SHA-256 do token do cookie: o token em si nunca é salvo. */
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    role: text("role").$type<Role>().notNull().default("member"),
    email: text("email"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    acceptedBy: uuid("accepted_by").references(() => users.id, { onDelete: "set null" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("invitations_org_idx").on(t.orgId)],
);

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  locationLabel: text("location_label"),
  locationLat: doublePrecision("location_lat"),
  locationLng: doublePrecision("location_lng"),
  defaultRadiusKm: integer("default_radius_km").notNull().default(10),
  service: text("service").notNull().default("sites"),
  autoEnrich: boolean("auto_enrich").notNull().default(true),
  messageTemplates: jsonb("message_templates").$type<MessageTemplate[]>(),
  activeTemplateId: text("active_template_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ───────────── Empresas, leads e listas (sempre por organização) ───────────── */

export type CompanySource = "google" | "demo" | "import" | "manual";

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    placeId: text("place_id"),
    source: text("source").$type<CompanySource>().notNull(),
    name: text("name").notNull(),
    /** Cópia dos dados do provedor de lugares; renovada quando passa do prazo de cache. */
    data: jsonb("data").$type<Place>().notNull(),
    enrichment: jsonb("enrichment").$type<Enrichment | null>(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("companies_org_place_idx").on(t.orgId, t.placeId).where(sql`${t.placeId} is not null`),
    index("companies_org_idx").on(t.orgId),
  ],
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    status: text("status").$type<LeadStatus>().notNull().default("novo"),
    position: doublePrecision("position").notNull().default(0),
    companyName: text("company_name").notNull(),
    contactName: text("contact_name"),
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    website: text("website"),
    instagram: text("instagram"),
    email: text("email"),
    notes: text("notes").notNull().default(""),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    firstContactAt: timestamp("first_contact_at", { withTimezone: true }),
    lastContactAt: timestamp("last_contact_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("leads_org_company_idx").on(t.orgId, t.companyId),
    index("leads_org_status_idx").on(t.orgId, t.status),
    index("leads_assigned_idx").on(t.assignedTo),
  ],
);

export type LeadEventKind = "nota" | "whatsapp" | "ligacao" | "status" | "sistema";

export const leadEvents = pgTable(
  "lead_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    kind: text("kind").$type<LeadEventKind>().notNull(),
    body: text("body").notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [index("lead_events_lead_idx").on(t.leadId, t.createdAt)],
);

export const lists = pgTable(
  "lists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("lists_org_idx").on(t.orgId)],
);

export const listItems = pgTable(
  "list_items",
  {
    listId: uuid("list_id")
      .notNull()
      .references(() => lists.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    addedBy: uuid("added_by").references(() => users.id, { onDelete: "set null" }),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.listId, t.companyId] }), index("list_items_company_idx").on(t.companyId)],
);

/** Favoritos são pessoais: cada usuário vê só os seus. */
export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.companyId] })],
);

/* ───────────── Buscas, uso e plano ───────────── */

export const searches = pgTable(
  "searches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    query: text("query").notNull(),
    params: jsonb("params").$type<Record<string, unknown>>().notNull(),
    /** Estado de paginação por região (tokens de página do provedor). */
    cursor: jsonb("cursor").$type<unknown>(),
    resultCount: integer("result_count").notNull().default(0),
    provider: text("provider").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("searches_user_idx").on(t.userId, t.createdAt), index("searches_org_idx").on(t.orgId, t.createdAt)],
);

export const usage = pgTable(
  "usage",
  {
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    period: text("period").notNull(),
    searches: integer("searches").notNull().default(0),
    results: integer("results").notNull().default(0),
    exports: integer("exports").notNull().default(0),
    enrichments: integer("enrichments").notNull().default(0),
    alertedAt: timestamp("alerted_at", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.orgId, t.period] })],
);

/* ───────────── Atividade e notificações ───────────── */

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    type: text("type").notNull(),
    entityId: uuid("entity_id"),
    summary: text("summary").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("activities_org_idx").on(t.orgId, t.createdAt)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body"),
    href: text("href"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.createdAt)],
);

/* ───────────── Caches globais ───────────── */

/** Dados públicos extraídos dos sites das empresas (e-mail, redes sociais). */
export const enrichmentCache = pgTable("enrichment_cache", {
  url: text("url").primaryKey(),
  data: jsonb("data").$type<Enrichment>().notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Coordenadas de áreas pesquisadas. Os termos do Google permitem guardar lat/lng por até 30 dias. */
export const geocodeCache = pgTable("geocode_cache", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  viewport: jsonb("viewport").$type<{ low: { lat: number; lng: number }; high: { lat: number; lng: number } } | null>(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Limite de tentativas de login por chave (IP ou e-mail). */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});
