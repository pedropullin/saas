"use client";

import { toast } from "@/client/toast";
import { removeFavoriteAction } from "@/server/favorites/actions";
import { CompanyTable, type CompanyItem } from "./CompanyTable";

export function FavoritesTable({ items }: { items: CompanyItem[] }) {
  return (
    <CompanyTable
      items={items}
      filename="prospecta-favoritos"
      onRemove={async (ids) => {
        for (const id of ids) {
          const result = await removeFavoriteAction(id);
          if (!result.ok) {
            toast.error(result.error);
            return false;
          }
        }
        return true;
      }}
    />
  );
}
