"use client";

import { buttonClass } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/misc";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ErrorState
        message="Não foi possível carregar esta página. Tente de novo em instantes."
        action={
          <button type="button" onClick={reset} className={buttonClass("outline", "sm")}>
            Tentar de novo
          </button>
        }
      />
    </div>
  );
}
