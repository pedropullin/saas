"use client";

import { Bell } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { Popover } from "@/components/ui/Popover";
import { Skeleton } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import { getNotificationsAction, markNotificationsReadAction } from "@/server/notifications/actions";
import { useApp } from "./AppContext";

type Item = { id: string; title: string; body: string | null; href: string | null; read: boolean; createdAt: string };

function ago(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function NotificationsBell() {
  const { unread: initialUnread } = useApp();
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<Item[] | null>(null);

  async function load() {
    const result = await getNotificationsAction();
    if (result.ok) {
      setItems(result.data.items);
      if (result.data.unread) {
        await markNotificationsReadAction();
        setUnread(0);
      }
    } else setItems([]);
  }

  return (
    <Popover
      className="w-[340px]"
      onOpenChange={(open) => open && void load()}
      trigger={({ toggle, open }) => (
        <button type="button" onClick={toggle} aria-expanded={open} aria-label={`Notificações${unread ? ` (${unread} novas)` : ""}`} className="relative grid h-10 w-10 place-items-center rounded-xl text-mute-2 hover:bg-white/[0.06] hover:text-paper">
          <Bell size={20} weight={unread ? "fill" : "regular"} />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>
          )}
        </button>
      )}
    >
      {(close) => (
        <div>
          <p className="border-b border-line px-4 py-3 text-sm font-semibold">Notificações</p>
          <div className="max-h-[360px] overflow-y-auto">
            {items === null && (
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}
            {items?.length === 0 && <p className="px-4 py-8 text-center text-sm text-mute">Nada por aqui ainda.</p>}
            {items?.map((item) => {
              const content = (
                <>
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", item.read ? "bg-transparent" : "bg-brand")} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm">{item.title}</span>
                    {item.body && <span className="block truncate text-xs text-mute">{item.body}</span>}
                  </span>
                  <span className="shrink-0 text-[11px] text-mute">{ago(item.createdAt)}</span>
                </>
              );
              return item.href ? (
                <Link key={item.id} href={item.href} onClick={close} className="flex gap-3 border-b border-line px-4 py-3 last:border-0 hover:bg-white/[0.03]">
                  {content}
                </Link>
              ) : (
                <div key={item.id} className="flex gap-3 border-b border-line px-4 py-3 last:border-0">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Popover>
  );
}
