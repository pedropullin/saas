import { describe, expect, it } from "vitest";
import { decodeCfEmail, extractContacts } from "./extract";
import { isPrivateIp } from "./safe-fetch";

const cf = (key: number, text: string) =>
  key.toString(16).padStart(2, "0") + [...text].map((c) => (c.charCodeAt(0) ^ key).toString(16).padStart(2, "0")).join("");

const HTML = `
<html><body>
  <a href="mailto:Contato@Padaria.com.br?subject=oi">Fale conosco</a>
  <a href="https://www.instagram.com/p/abc123/">post</a>
  <a href="https://instagram.com/padariaboa/">Instagram</a>
  <a href="https://www.facebook.com/sharer/sharer.php?u=x">share</a>
  <a href="https://facebook.com/padariaboa">Facebook</a>
  <a href="https://www.linkedin.com/company/padaria-boa/">LinkedIn</a>
  <a href="https://api.whatsapp.com/send?phone=5541999998888&amp;text=oi">Whats</a>
  <a href="/contato">Contato</a>
  <img src="logo@2x.png"> vendas@padaria.com.br
  <span class="__cf_email__" data-cfemail="${cf(0x54, "financeiro@padaria.com.br")}">[email]</span>
  <script>var x = "tracker@sentry.io"</script>
</body></html>`;

describe("extractContacts", () => {
  it("acha e-mails, redes, WhatsApp e página de contato", () => {
    const found = extractContacts(HTML, "https://padaria.com.br/");
    expect(found.emails).toEqual(["contato@padaria.com.br", "financeiro@padaria.com.br", "vendas@padaria.com.br"]);
    expect(found.instagram).toBe("https://instagram.com/padariaboa");
    expect(found.facebook).toBe("https://facebook.com/padariaboa");
    expect(found.linkedin).toBe("https://linkedin.com/company/padaria-boa");
    expect(found.whatsapp).toBe("5541999998888");
    expect(found.contactPage).toBe("https://padaria.com.br/contato");
  });

  it("decodifica e-mail protegido pelo Cloudflare", () => {
    expect(decodeCfEmail(cf(0x42, "oi@loja.com"))).toBe("oi@loja.com");
    expect(decodeCfEmail("zz")).toBeNull();
  });
});

describe("isPrivateIp", () => {
  it("bloqueia redes internas e libera IPs públicos", () => {
    for (const ip of ["127.0.0.1", "10.0.0.5", "172.20.1.1", "192.168.0.10", "169.254.169.254", "0.0.0.0", "::1", "fd00::1", "::ffff:10.0.0.1", "100.64.0.1"]) {
      expect(isPrivateIp(ip), ip).toBe(true);
    }
    for (const ip of ["8.8.8.8", "142.250.72.14", "2606:4700::1111"]) expect(isPrivateIp(ip), ip).toBe(false);
  });
});
