# prospecta.ai

Site de prospecção B2B para você e seus amigos. Busque empresas de qualquer lugar do mundo no Google Maps, veja nota e avaliações, filtre quem não tem site e chame no WhatsApp ou ligue em um clique.

Visual preto, branco e vermelho. Feito com Next.js 16, React 19 e Tailwind 4.

## O que tem

- **Busca global** por segmento e local ("dentistas" em "Recife"), perto de mim com raio, ou várias regiões de uma vez separadas por `;`.
- **WhatsApp em um clique** com mensagem pronta e personalizada com os dados da empresa.
- **Ligação direta** pelo `tel:`.
- **Avaliações**: nota, número de avaliações, comentários recentes e horário de funcionamento.
- **Filtros**: com WhatsApp, sem site, nota mínima, mínimo de avaliações, aberto agora, com telefone.
- **Mapa** com pins numerados ligados à lista.
- **Minha lista**: funil com status (Novo, Contatado, Respondeu, Negociando, Fechado, Perdido), anotações e quem adicionou.
- **Exportar CSV** dos resultados ou da lista, e backup em JSON para trocar listas entre amigos.
- **Acesso por código**: cada amigo entra com o próprio nome e um código que você define.
- **Modo demonstração** automático quando não há chave do Google, com empresas fictícias e contato bloqueado.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha as chaves (ou deixe vazio para o modo demonstração)
npm run dev                  # http://localhost:3000
```

Outros comandos:

```bash
npm run build      # build de produção
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm test           # testes (Vitest)
```

## Configurar o Google Maps

1. Crie um projeto em [console.cloud.google.com](https://console.cloud.google.com) e ative o faturamento.
2. Em **APIs e serviços → Biblioteca**, ative **Places API (New)** e **Maps JavaScript API**.
3. Crie **duas chaves** em **Credenciais**:
   - **Chave de servidor** (`GOOGLE_MAPS_API_KEY`). Restrinja a API a *Places API (New)*. Ela nunca vai para o navegador.
   - **Chave de navegador** (`GOOGLE_MAPS_BROWSER_KEY`). Restrinja por *Referenciadores HTTP* ao seu domínio (ex.: `https://seusite.vercel.app/*`) e a API a *Maps JavaScript API*.
4. Coloque as chaves no `.env.local` ou nas variáveis de ambiente da hospedagem.

Sem a chave de servidor, o site roda em modo demonstração. Sem a chave de navegador, a busca funciona com dados reais, mas o mapa vira um mapa esquemático e cada empresa continua com o botão "Google Maps".

**Custo.** Cada busca e cada abertura de detalhes é cobrada pelo Google. Telefone, site e nota caem na faixa *Enterprise* da Places API, e as avaliações na faixa *Enterprise + Atmosphere*. Confira a [tabela de preços](https://developers.google.com/maps/billing-and-pricing/pricing) e defina limites de cota no Google Cloud.

## Variáveis de ambiente

| Variável | Para quê |
| --- | --- |
| `GOOGLE_MAPS_API_KEY` | Buscas e detalhes na Places API (New), só no servidor. |
| `GOOGLE_MAPS_BROWSER_KEY` | Desenhar o Google Maps no navegador. |
| `PROSPECTA_ACCESS_CODES` | Códigos de acesso separados por vírgula, ex.: `lobo-vermelho,time2026`. |
| `PROSPECTA_SESSION_SECRET` | Segredo que assina o cookie de sessão. Gere com `openssl rand -hex 32`. |

**Proteja o acesso antes de publicar.** Com `PROSPECTA_ACCESS_CODES` vazio, qualquer pessoa com o link usa a sua cota do Google.

## Publicar na Vercel

1. Importe este repositório em [vercel.com/new](https://vercel.com/new).
2. Adicione as quatro variáveis de ambiente acima.
3. Faça o deploy e adicione o domínio da Vercel na restrição da chave de navegador.

## Como o WhatsApp é detectado

O Google não informa se um número tem WhatsApp. O Prospecta classifica assim:

| Situação | Selo | Botão |
| --- | --- | --- |
| A empresa cadastrou um link `wa.me` ou `api.whatsapp.com` como site | WhatsApp confirmado | WhatsApp |
| O telefone é de celular | Celular · provável WhatsApp | WhatsApp |
| O telefone é fixo | Telefone fixo | Tentar WhatsApp |

O tipo de linha vem da biblioteca `libphonenumber-js` e funciona para números de qualquer país. Quem você chama no WhatsApp ou por ligação entra na lista como "Contatado".

## Limites e cuidados

- O Google entrega **até 60 empresas por busca**, em páginas de 20. Para cobrir uma cidade inteira, busque por bairro: `Moema; Pinheiros; Tatuapé`.
- A lista de leads fica **no navegador** de cada pessoa. Para juntar listas, use "Backup para amigo" e "Importar".
- Os [termos da Google Maps Platform](https://cloud.google.com/maps-platform/terms) restringem guardar dados do Places por muito tempo. A lista guarda uma cópia dos dados da empresa para funcionar offline. Se isso for um problema para o seu uso, guarde só o ID do lugar e recarregue os detalhes ao abrir.
- Pelos mesmos termos, dados do Places só podem aparecer em mapa do Google. Por isso o mapa real usa a Maps JavaScript API.
- Respeite quem pedir para não ser contatado e as regras da LGPD para comunicação comercial.

## Estrutura

```
app/
  page.tsx                 landing page
  entrar/                  login com nome + código
  (app)/prospectar/        busca, filtros, lista e mapa
  (app)/lista/             funil de leads
  api/places/search        Places API: Text Search (New)
  api/places/[id]          Places API: Place Details (New)
  api/auth/                login e logout
proxy.ts                   protege /prospectar, /lista e /api/places
components/app/            interface do app
components/landing/        landing e login
lib/                       Google Places, telefone/WhatsApp, sessão, filtros, CSV, lista
```
