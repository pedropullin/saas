"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { hasAdminSession } from "@/lib/auth/admin-session";
import { VMark } from "@/components/ui/VMark";

const noopSubscribe = () => () => {};

/** null until hydration reconciles the real (client-only) session check. */
function useAdminAuthorized(): boolean | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => hasAdminSession(),
    () => null
  );
}

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const authorized = useAdminAuthorized();

  useEffect(() => {
    if (authorized === false) router.replace("/admin/login");
  }, [authorized, router]);

  if (authorized !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <VMark variant="solid" size={32} tone="paper" breathe />
      </div>
    );
  }

  return <>{children}</>;
}
