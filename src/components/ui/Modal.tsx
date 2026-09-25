"use client";

import { X } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

function useDialog(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return ref;
}

function Header({ title, description, onClose }: { title: string; description?: React.ReactNode; onClose: () => void }) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 md:px-6">
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight md:text-lg">{title}</h2>
        {description && <div className="mt-0.5 text-sm text-mute">{description}</div>}
      </div>
      <button type="button" onClick={onClose} className="-mr-2 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-mute hover:bg-white/5 hover:text-paper" aria-label="Fechar">
        <X size={18} />
      </button>
    </header>
  );
}

/** Modal centralizado sobre o <dialog> nativo (foco preso e Esc). */
export function Modal({ open, onClose, title, description, children, footer, className }: OverlayProps) {
  const ref = useDialog(open);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      className={cn(
        "m-auto max-h-[90dvh] w-[min(94vw,640px)] overflow-hidden rounded-2xl border border-line-2 bg-ink-2 p-0 text-paper shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm",
        className,
      )}
    >
      {open && (
        <div className="flex max-h-[90dvh] flex-col">
          <Header title={title} description={description} onClose={onClose} />
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3 md:px-6">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}

/** Painel lateral (desktop) que vira gaveta de baixo no celular. */
export function Sheet({ open, onClose, title, description, children, footer, className }: OverlayProps) {
  const ref = useDialog(open);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      className={cn(
        "m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-3xl border border-line-2 bg-ink-2 p-0 text-paper shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm",
        "md:ml-auto md:mt-0 md:h-dvh md:max-h-dvh md:w-[440px] md:rounded-none md:rounded-l-2xl md:border-y-0 md:border-r-0",
        className,
      )}
    >
      {open && (
        <div className="animate-slide-up flex max-h-[92dvh] flex-col md:h-dvh md:max-h-dvh md:animate-slide-in">
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line-2 md:hidden" aria-hidden="true" />
          <Header title={title} description={description} onClose={onClose} />
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer && <footer className="flex flex-wrap gap-2 border-t border-line px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
