# Prospecta.ai

Plataforma SaaS de prospecção B2B. Encontre empresas em qualquer lugar do mundo com dados oficiais do Google Maps, veja contatos e avaliações, e fale com o dono pelo WhatsApp ou por ligação em poucos cliques.

**Fluxo principal:** Pesquisar → Filtrar → Encontrar empresa → Ver dados → WhatsApp/Ligar → Salvar lead.

Next.js 16 (App Router), React 19, Tailwind 4, Drizzle ORM com Postgres, autenticação própria, Google Places API (New) e Maps JavaScript API.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # pode deixar tudo vazio para começar
npm run dev                  # http://localhost:3000
```

Sem nenhuma variável configurada, o app funciona de ponta a ponta:

- **Banco:** PGlite, um Postgres embutido salvo em `.data/pglite`. As migrações rodam sozinhas.
- **Empresas:** modo demonstração, com empresas fictícias marcadas como `DEMO` e contato bloqueado.
- **Mapa:** mapa esquemático no lugar do Google Maps.

Crie uma conta em `/cadastro` e faça uma pesquisa.

```bash
npm test           # 43 testes (Vitest), incluindo isolamento de dados entre contas
npm run lint
npm run typecheck
npm run build
```

## Colocar em produção

1. **Banco:** crie um Postgres (Supabase, Neon ou outro) e defina `DATABASE_URL`. No Supabase, use a string de conexão do pooler.
2. **Google Cloud:** ative a **Places API (New)** e a **Maps JavaScript API** e crie duas chaves.
   - `GOOGLE_MAPS_API_KEY` é a chave de servidor. Restrinja a API à Places API (New).
   - `GOOGLE_MAPS_BROWSER_KEY` é a chave de navegador. Restrinja por referenciador HTTP ao seu domínio e à Maps JavaScript API.
3. **Vercel:** importe o repositório, configure as variáveis do `.env.example` e faça o deploy. As migrações rodam na primeira requisição, protegidas por lock.

Para rodar as migrações manualmente:

```bash
DATABASE_URL=postgres://... DB_AUTO_MIGRATE=false npm run db:migrate
```

## O que a plataforma faz

| Área | Recursos |
| --- | --- |
| Prospectar | Texto livre (“Empresas sem site em Curitiba”), categoria, país, estado, cidade, bairro, CEP, raio em km, busca mundial e varredura de área |
| Filtros | Possui ou não site, WhatsApp, telefone, Instagram, Facebook, e-mail, aberto agora, nota mínima e máxima, mínimo de avaliações |
| Resultados | Lista e mapa lado a lado, seleção múltipla, ações em massa, exportação CSV e “carregar mais” |
| Empresa | Fotos, contatos, redes, horário, avaliações, mapa, “Informações para prospecção” e análise de oportunidade |
| Prospectar (ações rápidas) | WhatsApp com mensagem pronta, Ligar, abrir Instagram ou site, copiar telefone ou dados, observações |
| Leads | Kanban com arrastar e soltar em 6 etapas, tabela, responsável, tags, linha do tempo, importação e exportação CSV |
| Listas e Favoritos | Listas da equipe e favoritos pessoais |
| Histórico | Pesquisas pessoais, com “Repetir” que restaura todos os filtros |
| Mapa | Tela cheia, raio ajustável e cartão ao clicar no marcador |
| Dashboard | Empresas encontradas, salvas, leads, contatados, negociação, clientes, taxa de contato, gráficos de 30 dias e funil |
| Equipe | Convite por link de uso único, papéis (dono, administrador, membro), leads atribuídos e convertidos, atividade |
| Planos | Free, Pro e Business com limites aplicados no servidor. Nesta versão, sem cobrança |

## Dados: de onde vêm e o que não é inventado

- **Empresas, telefone, site, nota, avaliações, horário e fotos** vêm da Google Places API (New).
- **E-mail, Instagram, Facebook, LinkedIn e WhatsApp publicados no site** são lidos da página inicial e da página de contato de cada empresa. A leitura bloqueia endereços de rede interna (proteção contra SSRF) e fica em cache por 14 dias.
- **WhatsApp:** o Google não informa quem tem. Um link `wa.me` publicado pela empresa conta como confirmado, um celular como provável, e um fixo como incerto.
- **Quando um dado não existe**, a interface mostra “Não encontrado”. E-mail e redes de uma empresa com site ainda não lido aparecem como “Verificando…”.
- **Empresa verificada** e **ordenar por mais recentes** aparecem desativados. A API oficial do Google não fornece esses dados.
- **Análise de oportunidade:** regras simples sobre os dados encontrados (site, contato, nota, avaliações, redes). Nenhum dado é estimado.

## Segurança

- **Senhas:** scrypt com salt. Sessões guardam no banco só o hash SHA-256 do token do cookie, que é httpOnly, `SameSite=Lax` e `Secure` em produção.
- **Autorização:** toda página, Server Action e rota de API valida a sessão no banco. Rotas de API recusam requisições de outra origem.
- **Isolamento:** todo dado de negócio tem `org_id`, e todas as consultas filtram por ele. Leads, listas e notas são compartilhados só dentro da equipe. Favoritos, histórico e configurações são pessoais. Os testes em `src/server/isolation.test.ts` cobrem isso.
- **Limite de tentativas:** login e cadastro têm limite por IP e por e-mail, guardado no banco.
- **Uso da cota:** o limite de pesquisas do plano é contado no servidor, antes de chamar o Google.

## Arquitetura

```
src/
  app/                 páginas (landing, auth, /app/*) e rotas de API
  components/          interface por área: prospect, maps, company, leads, lists, team, settings, shell, ui
  client/              estado do navegador: busca compartilhada, ações de empresa, toasts
  lib/                 regras puras e compartilhadas: tipos, filtros, contatos, oportunidade, planos, CSV
  server/
    db/                esquema Drizzle e conexão (Postgres ou PGlite)
    auth/              senhas, sessões, contas, convites, limite de tentativas
    places/            provedores de lugares (Google e demonstração), geocodificação, motor de busca
    enrichment/        leitura segura dos sites das empresas
    companies/ leads/ lists/ favorites/ history/
    billing/           planos, uso mensal e provedor de pagamento (modo teste)
    analytics/ team/ notifications/ activity/ settings/
drizzle/               migrações SQL
```

Para trocar ou somar uma fonte de empresas, implemente a interface `PlacesProvider` em `src/server/places/provider.ts`.

## Cobrança (próximo passo)

A interface de planos está pronta e os limites já são aplicados. Para cobrar de verdade, implemente um provedor de pagamento com o contrato `BillingProvider` em `src/server/billing/provider.ts`. Ele pode ser Stripe Checkout, Pagar.me ou Mercado Pago. Crie também um webhook que atualize `organizations.plan`. Até lá, `BILLING_MODE=test` aplica a troca de plano na hora.

## Custos e termos do Google

- Cada pesquisa, página extra, detalhe de empresa e foto é cobrado pelo Google. Telefone, site e nota caem na faixa Enterprise da Places API. Veja a [tabela de preços](https://developers.google.com/maps/billing-and-pricing/pricing) e defina cotas no Google Cloud.
- Os detalhes de uma empresa ficam 10 minutos em memória para evitar cobrança repetida.
- Os [termos da Google Maps Platform](https://cloud.google.com/maps-platform/terms) limitam guardar dados do Places. O app guarda uma cópia dos dados das empresas que você salva como lead, lista ou favorito, e a renova quando você abre a empresa. Coordenadas de áreas pesquisadas ficam no máximo 30 dias. Avalie essa política para o seu uso.
- Dados do Places só aparecem em mapa do Google. Sem a chave de navegador, o app mostra um mapa esquemático, sem base cartográfica.

## Limitações conhecidas

- O Google entrega até 60 empresas por pesquisa. A varredura (2×2 no Pro, 3×3 no Business) divide a área para ir além.
- Não há recuperação de senha por e-mail, porque o app ainda não envia e-mails. Um administrador pode remover o membro e convidar de novo.
- Com PGlite, os dados ficam no disco da máquina. Em hospedagem serverless, use `DATABASE_URL`.
