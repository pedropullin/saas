import { afterEach, describe, expect, it, vi } from "vitest";
import { createSessionToken, isValidAccessCode, readSessionToken, safeEqual } from "./session";

afterEach(() => vi.unstubAllEnvs());

describe("sessão assinada", () => {
  it("lê o token que criou", async () => {
    const token = await createSessionToken("João Ávila", Date.now(), "segredo");
    expect(await readSessionToken(token, Date.now(), "segredo")).toMatchObject({ name: "João Ávila" });
  });

  it("recusa token adulterado, com outro segredo ou expirado", async () => {
    const token = await createSessionToken("Ana", Date.now(), "segredo");
    const [, exp, sig] = token.split(".");
    const forged = `${Buffer.from("Admin").toString("base64url")}.${exp}.${sig}`;
    expect(await readSessionToken(forged, Date.now(), "segredo")).toBeNull();
    expect(await readSessionToken(token, Date.now(), "outro")).toBeNull();
    expect(await readSessionToken(token, Date.now() + 31 * 24 * 3600 * 1000, "segredo")).toBeNull();
    expect(await readSessionToken("lixo", Date.now(), "segredo")).toBeNull();
  });
});

describe("códigos de acesso", () => {
  it("aceita qualquer código da lista", () => {
    vi.stubEnv("PROSPECTA_ACCESS_CODES", "alfa, beta ,gama");
    expect(isValidAccessCode("beta")).toBe(true);
    expect(isValidAccessCode(" gama ")).toBe(true);
    expect(isValidAccessCode("delta")).toBe(false);
    expect(isValidAccessCode("")).toBe(false);
  });

  it("compara strings com segurança", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});
