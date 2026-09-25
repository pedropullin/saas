import { sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { getDb } from "./client";

describe("banco", () => {
  it("sobe o PGlite e aplica as migrações", async () => {
    const db = await getDb();
    const result = await db.execute(sql`select count(*)::int as n from information_schema.tables where table_schema = 'public'`);
    const rows = (result as unknown as { rows: Array<{ n: number }> }).rows;
    expect(rows[0]!.n).toBeGreaterThanOrEqual(19);
  });
});
