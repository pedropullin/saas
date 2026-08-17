import type { Metadata } from "next";
import { VMark } from "@/components/ui/VMark";
import { Wordmark } from "@/components/ui/Wordmark";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "VEYRO Admin" };

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-ink px-6">
      <VMark
        variant="split"
        size={520}
        tone="paper"
        className="pointer-events-none absolute -right-32 -top-32 opacity-[0.04]"
      />
      <div className="relative flex flex-col items-center text-center">
        <div className="flex items-center gap-2.5">
          <VMark variant="solid" size={26} tone="paper" />
          <Wordmark className="text-xl text-off-white" />
        </div>
        <h1 className="mt-8 text-h2 font-medium text-off-white">VEYRO Admin</h1>
        <p className="mt-2 text-[0.875rem] text-off-white/50">
          Acesso restrito à equipe interna.
        </p>

        <div className="mt-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
