import { TransitionLink } from "@/components/providers/TransitionLink";

/**
 * The entire site is one continuous narrative — no traditional multi-column
 * footer. This is the single utility line every cinematic chapter eventually
 * needs: legal line + the handful of routes that aren't reachable by scroll.
 */
export function ClosingBar() {
  return (
    <div className="border-t border-off-white/10 bg-ink py-6">
      <div className="mx-auto flex w-full max-w-[var(--container-page)] flex-col items-center justify-between gap-3 px-6 text-[0.75rem] text-off-white/35 sm:flex-row md:px-10">
        <p>© {new Date().getFullYear()} veyro — sistema de identidade de marca.</p>
        <nav className="flex items-center gap-6">
          <TransitionLink href="/login" className="transition-colors hover:text-off-white/70">
            Entrar
          </TransitionLink>
          <TransitionLink href="/app" className="transition-colors hover:text-off-white/70">
            Produto
          </TransitionLink>
          <TransitionLink href="/admin/login" className="transition-colors hover:text-off-white/70">
            Admin
          </TransitionLink>
        </nav>
      </div>
    </div>
  );
}
