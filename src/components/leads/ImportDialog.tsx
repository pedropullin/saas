"use client";

import { FileCsv, SpinnerGap, UploadSimple } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { toast } from "@/client/toast";
import { buttonClass } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { parseCsv } from "@/lib/csv";
import { isLeadStatus, LEAD_STATUSES, type LeadStatus } from "@/lib/leads";
import { importLeadsAction } from "@/server/leads/actions";

type Row = Record<string, string | string[] | undefined>;

const FIELDS: Array<[string, RegExp]> = [
  ["companyName", /^(empresa|nome|company|razao social|raz[aã]o social|nome da empresa)$/],
  ["contactName", /^(contato|pessoa|respons[aá]vel|contact)$/],
  ["phone", /^(telefone|fone|phone|celular)$/],
  ["whatsapp", /^(whatsapp|whats|wpp)$/],
  ["website", /^(site|website|url)$/],
  ["instagram", /^(instagram|insta)$/],
  ["email", /^(e-?mail|email)$/],
  ["city", /^(cidade|city)$/],
  ["category", /^(segmento|categoria|category|ramo)$/],
  ["address", /^(endere[cç]o|address)$/],
  ["status", /^(status|etapa)$/],
  ["tags", /^(tags|etiquetas)$/],
  ["notes", /^(observa[cç][oõ]es|notas|anota[cç][oõ]es|notes)$/],
];

function normalizeHeader(h: string) {
  return h.trim().toLowerCase().normalize("NFC");
}

function toStatus(value: string | undefined): LeadStatus | undefined {
  if (!value) return undefined;
  const v = value.trim().toLowerCase();
  if (isLeadStatus(v)) return v;
  return LEAD_STATUSES.find((s) => s.label.toLowerCase() === v)?.id;
}

export function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [mapped, setMapped] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function read(file: File) {
    const table = parseCsv(await file.text());
    const [header, ...body] = table;
    if (!header || !body.length) return toast.error("Planilha vazia ou sem cabeçalho.");
    const columns = header.map((h) => FIELDS.find(([, re]) => re.test(normalizeHeader(h)))?.[0] ?? null);
    if (!columns.includes("companyName")) return toast.error("A planilha precisa de uma coluna “Empresa” (ou “Nome”).");
    setMapped(header.filter((_, i) => columns[i]).map((h, i) => `${h} → ${columns.filter(Boolean)[i]}`));
    setRows(
      body
        .map((cells) => {
          const row: Row = {};
          columns.forEach((field, i) => {
            const value = cells[i]?.trim();
            if (field && value) row[field] = value;
          });
          if (typeof row.tags === "string") row.tags = row.tags.split(/[;,]/).map((t) => t.trim()).filter(Boolean);
          if (typeof row.status === "string") row.status = toStatus(row.status);
          return row;
        })
        .filter((row) => row.companyName),
    );
  }

  async function submit() {
    setBusy(true);
    let imported = 0;
    for (let i = 0; i < rows.length; i += 500) {
      const result = await importLeadsAction(rows.slice(i, i + 500));
      if (!result.ok) {
        setBusy(false);
        return toast.error(result.error);
      }
      imported += result.data;
    }
    setBusy(false);
    toast.success(`${imported} leads importados.`);
    window.location.reload();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setRows([]);
        onClose();
      }}
      title="Importar lista de leads"
      description="CSV com cabeçalho. Colunas reconhecidas: Empresa, Contato, Telefone, WhatsApp, Site, Instagram, E-mail, Cidade, Segmento, Endereço, Status, Tags, Observações."
      footer={
        <>
          <button type="button" onClick={onClose} className={buttonClass("ghost", "md")}>
            Cancelar
          </button>
          <button type="button" disabled={!rows.length || busy} onClick={submit} className={buttonClass("primary", "md")}>
            {busy && <SpinnerGap size={15} className="animate-spin" />} Importar {rows.length || ""} leads
          </button>
        </>
      }
    >
      <div className="p-5 md:p-6">
        <input ref={input} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && void read(e.target.files[0])} />
        <button type="button" onClick={() => input.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-line-2 px-6 py-10 text-center hover:border-brand/60">
          <UploadSimple size={26} className="text-brand" />
          <span className="font-medium">Escolher arquivo CSV</span>
          <span className="text-xs text-mute">Separado por vírgula ou ponto e vírgula, até 2.000 linhas por vez.</span>
        </button>
        {rows.length > 0 && (
          <div className="mt-5">
            <p className="flex items-center gap-2 text-sm font-medium">
              <FileCsv size={18} className="text-brand" /> {rows.length} leads prontos para importar
            </p>
            <p className="mt-1 text-xs text-mute">{mapped.join(" · ")}</p>
            <ul className="mt-3 divide-y divide-line rounded-xl border border-line text-sm">
              {rows.slice(0, 5).map((row, i) => (
                <li key={i} className="flex justify-between gap-3 px-3 py-2">
                  <span className="truncate">{row.companyName as string}</span>
                  <span className="shrink-0 text-mute">{(row.phone as string) ?? (row.email as string) ?? ""}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}
