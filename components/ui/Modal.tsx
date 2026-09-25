"use client";

import { X } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/** Modal acessível sobre o <dialog> nativo (foco preso e Esc de graça). */
export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[min(92vw,760px)] max-h-[88dvh] overflow-hidden rounded-2xl border border-line-2 bg-ink-2 p-0 text-paper shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm",
        className,
      )}
    >
      {open && (
        <div className="flex max-h-[88dvh] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              {description && <p className="mt-1 text-sm text-mute">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 grid h-9 w-9 place-items-center rounded-lg text-mute hover:bg-white/5 hover:text-paper"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </header>
          <div className="overflow-y-auto">{children}</div>
        </div>
      )}
    </dialog>
  );
}
