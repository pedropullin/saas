import { describe, expect, it } from "vitest";
import { classifyWebsite, inferWhatsApp, parsePhone } from "./phone";

describe("parsePhone", () => {
  it("reconhece celular brasileiro", () => {
    const phone = parsePhone("+55 11 98765-4321", "(11) 98765-4321", "BR");
    expect(phone).toMatchObject({ e164: "+5511987654321", kind: "celular", country: "BR" });
  });

  it("reconhece fixo brasileiro", () => {
    expect(parsePhone("+55 11 3456-7890", null, "BR")?.kind).toBe("fixo");
  });

  it("usa o número nacional com dica de país quando não há internacional", () => {
    expect(parsePhone(null, "912 345 678", "PT")).toMatchObject({ e164: "+351912345678", kind: "celular" });
  });

  it("retorna null para lixo", () => {
    expect(parsePhone("abc", null, null)).toBeNull();
    expect(parsePhone(null, null, "BR")).toBeNull();
  });
});

describe("classifyWebsite", () => {
  it("separa link de WhatsApp e extrai o número", () => {
    expect(classifyWebsite("https://wa.me/5511987654321")).toMatchObject({
      website: null,
      whatsappNumber: "5511987654321",
    });
    expect(classifyWebsite("https://api.whatsapp.com/send?phone=5511987654321&text=oi").whatsappNumber).toBe(
      "5511987654321",
    );
  });

  it("não considera Instagram como site", () => {
    expect(classifyWebsite("https://www.instagram.com/loja")).toMatchObject({
      website: null,
      social: "https://www.instagram.com/loja",
    });
  });

  it("mantém site normal", () => {
    expect(classifyWebsite("https://loja.com.br/").website).toBe("https://loja.com.br/");
    expect(classifyWebsite("não é url").website).toBeNull();
  });
});

describe("inferWhatsApp", () => {
  const none = { whatsappLink: null, whatsappNumber: null };

  it("link publicado pela empresa é confirmado", () => {
    const info = inferWhatsApp(null, { whatsappLink: "https://wa.me/5511987654321", whatsappNumber: "5511987654321" });
    expect(info).toMatchObject({ confidence: "confirmado", number: "5511987654321" });
  });

  it("celular é provável, fixo é possível", () => {
    expect(inferWhatsApp(parsePhone("+55 11 98765-4321", null), none)?.confidence).toBe("provavel");
    expect(inferWhatsApp(parsePhone("+55 11 3456-7890", null), none)?.confidence).toBe("possivel");
  });

  it("sem telefone e sem link não tem WhatsApp", () => {
    expect(inferWhatsApp(null, none)).toBeNull();
  });
});
