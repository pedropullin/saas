/** Extração de contatos públicos do HTML de um site (funções puras, testáveis). */

export interface ExtractedContacts {
  emails: string[];
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  whatsapp: string | null;
  contactPage: string | null;
}

const ENTITY: Record<string, string> = { "&amp;": "&", "&#64;": "@", "&#x40;": "@", "&quot;": '"', "&#39;": "'", "&lt;": "<", "&gt;": ">" };

function decodeEntities(text: string): string {
  return text.replace(/&(amp|quot|lt|gt|#64|#x40|#39);/gi, (m) => ENTITY[m.toLowerCase()] ?? m);
}

/** E-mails escondidos pela proteção do Cloudflare (data-cfemail). */
export function decodeCfEmail(hex: string): string | null {
  if (!/^[0-9a-f]{4,}$/i.test(hex) || hex.length % 2) return null;
  const key = parseInt(hex.slice(0, 2), 16);
  let out = "";
  for (let i = 2; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
  return out.includes("@") ? out : null;
}

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,24}/gi;
const BAD_EMAIL = /\.(png|jpe?g|gif|webp|svg|css|js)$|@\d+x\.|sentry|wixpress|example\.(com|org)|domain\.com|email\.com|seudominio|yourdomain|@sentry/i;

const INSTAGRAM_SKIP = new Set(["p", "reel", "reels", "explore", "accounts", "stories", "tv", "share", "direct"]);
const FACEBOOK_SKIP = new Set(["sharer", "sharer.php", "share", "plugins", "tr", "dialog", "login", "watch", "events", "groups", "hashtag"]);

function absolute(href: string, base: string): URL | null {
  try {
    return new URL(href, base);
  } catch {
    return null;
  }
}

export function extractContacts(html: string, baseUrl: string): ExtractedContacts {
  const hrefs = [...html.matchAll(/href\s*=\s*["']([^"']{1,600})["']/gi)].map((m) => decodeEntities(m[1]!.trim()));
  const emails = new Set<string>();

  for (const href of hrefs) {
    if (/^mailto:/i.test(href)) {
      const address = decodeURIComponent(href.slice(7).split("?")[0] ?? "").trim().toLowerCase();
      if (address.match(EMAIL)) emails.add(address);
    }
  }
  for (const match of html.matchAll(/data-cfemail=["']([0-9a-f]+)["']/gi)) {
    const decoded = decodeCfEmail(match[1]!);
    if (decoded) emails.add(decoded.toLowerCase());
  }
  const text = decodeEntities(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
  for (const match of text.matchAll(EMAIL)) emails.add(match[0].toLowerCase());

  let instagram: string | null = null;
  let facebook: string | null = null;
  let linkedin: string | null = null;
  let whatsapp: string | null = null;
  let contactPage: string | null = null;
  const origin = absolute(baseUrl, baseUrl)?.origin;

  for (const href of hrefs) {
    const url = absolute(href, baseUrl);
    if (!url) continue;
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const segments = url.pathname.split("/").filter(Boolean);

    if (!instagram && host.endsWith("instagram.com") && segments[0] && !INSTAGRAM_SKIP.has(segments[0].toLowerCase())) {
      instagram = `https://instagram.com/${segments[0]}`;
    } else if (!facebook && /(^|\.)(facebook\.com|fb\.com)$/.test(host) && segments[0] && !FACEBOOK_SKIP.has(segments[0].toLowerCase())) {
      facebook = segments[0] === "profile.php" ? url.toString() : `https://facebook.com/${segments[0]}`;
    } else if (!linkedin && host.endsWith("linkedin.com") && (segments[0] === "company" || segments[0] === "in") && segments[1]) {
      linkedin = `https://linkedin.com/${segments[0]}/${segments[1]}`;
    } else if (!whatsapp && (host === "wa.me" || host.endsWith("whatsapp.com") || url.protocol === "whatsapp:")) {
      const digits = (host === "wa.me" ? segments[0] : url.searchParams.get("phone"))?.replace(/\D/g, "") ?? "";
      if (digits.length >= 10 && digits.length <= 15) whatsapp = digits;
    } else if (!contactPage && url.origin === origin && /(contato|contact|fale-conosco|faleconosco|atendimento)/i.test(url.pathname)) {
      contactPage = url.toString();
    }
  }

  return {
    emails: [...emails].filter((e) => !BAD_EMAIL.test(e) && e.length <= 100).slice(0, 5),
    instagram,
    facebook,
    linkedin,
    whatsapp,
    contactPage,
  };
}
