import "server-only";
import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import zlib from "node:zlib";

/** Bloqueia faixas internas: impede que o servidor seja usado para acessar a rede privada (SSRF). */
export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a = 0, b = 0] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 168 || b === 0)) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase();
    if (v === "::" || v === "::1") return true;
    const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIp(mapped[1]!);
    return /^(fc|fd|fe[89ab])/.test(v);
  }
  return true;
}

const allowPrivate = () => process.env.ENRICHMENT_ALLOW_PRIVATE === "true";

type LookupCallback = (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void;

function safeLookup(hostname: string, options: dns.LookupOptions, callback: LookupCallback) {
  dns.lookup(hostname, { all: true, family: options.family }, (error, addresses) => {
    if (error) return callback(error, "");
    const list = addresses as dns.LookupAddress[];
    if (!list.length || (!allowPrivate() && list.some((a) => isPrivateIp(a.address)))) {
      return callback(Object.assign(new Error("Endereço bloqueado"), { code: "EBLOCKED" }), "");
    }
    if (options.all) return callback(null, list);
    return callback(null, list[0]!.address, list[0]!.family);
  });
}

export interface FetchedPage {
  url: string;
  status: number;
  contentType: string;
  body: string;
}

const MAX_BYTES = 1_500_000;

function requestOnce(url: URL, timeoutMs: number): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http;
    const request = client.request(
      url,
      {
        method: "GET",
        lookup: safeLookup as unknown as net.LookupFunction,
        timeout: timeoutMs,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ProspectaBot/1.0; leitura de contatos públicos)",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.7",
        },
      },
      (response) => {
        const encoding = String(response.headers["content-encoding"] ?? "");
        const stream: NodeJS.ReadableStream = encoding.includes("br")
          ? response.pipe(zlib.createBrotliDecompress())
          : encoding.includes("gzip")
            ? response.pipe(zlib.createGunzip())
            : encoding.includes("deflate")
              ? response.pipe(zlib.createInflate())
              : response;
        const chunks: Buffer[] = [];
        let size = 0;
        const finish = () => resolve({ status: response.statusCode ?? 0, headers: response.headers, body: Buffer.concat(chunks) });
        stream.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_BYTES) {
            request.destroy();
            finish();
            return;
          }
          chunks.push(chunk);
        });
        stream.on("end", finish);
        stream.on("error", (error) => (size > MAX_BYTES ? finish() : reject(error)));
      },
    );
    request.on("timeout", () => request.destroy(new Error("Tempo esgotado")));
    request.on("error", reject);
    request.end();
  });
}

/** Busca uma página HTML pública seguindo até 4 redirecionamentos, validando cada destino. */
export async function fetchPublicHtml(rawUrl: string, timeoutMs = 7000): Promise<FetchedPage> {
  let url = new URL(rawUrl);
  for (let hop = 0; hop <= 4; hop++) {
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Protocolo não permitido");
    if (url.port && !["80", "443"].includes(url.port)) throw new Error("Porta não permitida");
    if (net.isIP(url.hostname) && isPrivateIp(url.hostname) && !allowPrivate()) throw new Error("Endereço bloqueado");
    const response = await requestOnce(url, timeoutMs);
    if (response.status >= 300 && response.status < 400 && response.headers.location) {
      url = new URL(response.headers.location, url);
      continue;
    }
    const contentType = String(response.headers["content-type"] ?? "");
    if (!/html|xml/i.test(contentType)) throw new Error("Resposta não é HTML");
    return { url: url.toString(), status: response.status, contentType, body: response.body.toString("utf8") };
  }
  throw new Error("Redirecionamentos demais");
}
