"use client";

import { Check, GearSix, Rocket, SignOut, UsersThree } from "@phosphor-icons/react";
import Link from "next/link";
import { Popover } from "@/components/ui/Popover";
import { Avatar } from "@/components/ui/misc";
import { signOutAction, switchOrgAction } from "@/server/auth/actions";
import { useApp } from "./AppContext";

export function UserMenu() {
  const { user, org, orgs, plan } = useApp();
  return (
    <Popover
      className="w-[280px]"
      trigger={({ toggle, open }) => (
        <button type="button" onClick={toggle} aria-expanded={open} aria-label="Menu do perfil" className="flex items-center gap-2 rounded-full p-0.5 pr-0.5 hover:bg-white/[0.06] lg:pr-3">
          <Avatar name={user.name} src={user.avatarUrl} size={34} />
          <span className="hidden text-left lg:block">
            <span className="block max-w-[140px] truncate text-sm leading-tight">{user.name}</span>
            <span className="block max-w-[140px] truncate text-[11px] leading-tight text-mute">{org.name}</span>
          </span>
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center gap-3 border-b border-line p-4">
            <Avatar name={user.name} src={user.avatarUrl} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-mute">{user.email}</p>
            </div>
          </div>
          {orgs.length > 1 && (
            <div className="border-b border-line p-2">
              <p className="px-2 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wider text-mute">Equipes</p>
              {orgs.map((o) => (
                <form key={o.id} action={switchOrgAction.bind(null, o.id)}>
                  <button type="submit" className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-white/[0.05]">
                    <span className="truncate">{o.name}</span>
                    {o.id === org.id && <Check size={15} className="text-brand" />}
                  </button>
                </form>
              ))}
            </div>
          )}
          <div className="p-2 text-sm">
            {[
              { href: "/app/configuracoes", label: "Configurações", icon: GearSix },
              { href: "/app/equipe", label: "Minha equipe", icon: UsersThree },
              { href: "/app/planos", label: `Plano ${plan.name}`, icon: Rocket },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={close} className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-mute-2 hover:bg-white/[0.05] hover:text-paper">
                <Icon size={17} /> {label}
              </Link>
            ))}
            <form action={signOutAction}>
              <button type="submit" className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-mute-2 hover:bg-white/[0.05] hover:text-paper">
                <SignOut size={17} /> Sair
              </button>
            </form>
          </div>
        </div>
      )}
    </Popover>
  );
}
