<div align="center">

# ClanSocket App

**ClanSocket - Live, Open-Source platform for Old School RuneScape clans**

The core application: a Vite/TypeScript dashboard SPA, an Express server, a Discord.js bot, an Electron desktop wrapper, and shared workspace packages — one npm-workspaces monorepo, multi-tenant by clan.

</div>

> GitHub repository: [`osrs-clansocket/clansocket-app-dev`](https://github.com/osrs-clansocket/clansocket-app-dev). This is the central repository of the ClanSocket system. It is a standalone Git repository that checks out as a flat sibling under the `clansocket-workspace` umbrella. When a claim here disagrees with the code, the code wins — fix this file. When it disagrees with `../clansocket-docs/`, the docs win.

---

## Role in the System

ClanSocket is a multi-tenant platform for Old School RuneScape clans. Every clan is its own tenant, resolved from the player's in-game clan name. This repository holds everything that runs the platform; the other repositories in the workspace support it:

| Sibling repository | Relation to this repo |
| --- | --- |
| `clansocket-plugin` (`clansocket-plugin-dev`) | The RuneLite client plugin. Streams telemetry and clan chat into this server over a single WebSocket at `wss://ws.clansocket.com/data`. |
| `clansocket-docs` | Canonical doctrine, design docs, and ongoing handoffs. The routing hub is `../clansocket-docs/INDEX.md`. |
| `clansocket-deploy` | Droplet deployment and nginx automation. Ships this app from the workspace root. |
| `clansocket-asset-ops` | In-place asset and map-tile optimization. Reads `public/` and writes optimized assets into `main/dashboard/src/`. |
| `clansocket-errors` | Branded error pages and the 830 minigame hub, served at the edge. |

The cross-repository contract: the plugin connects to this server's WebSocket, and the server routes each payload to the correct clan tenant by resolving the player's in-game clan name from the identity frame. Telemetry and clan chat ride the same transport.

The workspace umbrella pins each repository as a submodule and holds the orchestration command surface. Cross-package commands (deploy, nginx, asset pipelines, map pipeline) run from the workspace root, which delegates into each repository via `npm --prefix`. This package keeps only its own build, lint, sync, runtime, and submission commands.

---

## Architecture

Three runtimes and a set of shared packages live in one repository:

- **`main/discord/`** — a Discord.js v14 bot. TypeScript ESM (`"type": "module"`, run under `tsx`). It talks to the server over HTTP REST for persistence and consumes Server-Sent Events over the server's projection bus for `discord_*` table events. It never opens an inbound port and never opens a WebSocket. Entry: `main/discord/src/index.ts`.
- **`main/dashboard/`** — a Vite + TypeScript single-page app. Plain CSS, no preprocessor, no React or Vue. All rendering goes through DOM-factory primitives under `dom/factory/`; feature code never calls `document.createElement`. Routing lives in `managers/router/`, with overlay-scoped listeners in `managers/deep-link.ts`. State stores live at `state/<feature>/stores/<feature>-store.ts`. Entry: `main/dashboard/src/main.ts`.
- **`main/server/`** — an Express 5 + TypeScript server (run under `tsx`). It serves HTTPS in development (self-signed via mkcert) and plain HTTP behind nginx in production. In production it serves the built dashboard from `dist/` with Brotli content negotiation and an SPA fallback; in development the server port returns `{"error":"frontend_not_served_in_dev"}` for non-API requests, because Vite serves the dashboard separately. Entry: `main/server/src/index.ts`.
- **`main/electron/`** — a thin Electron desktop wrapper that loads the dashboard URL in a custom-chrome window. Packaged for Windows and Linux via electron-builder.

Shared workspace packages:

- **`shared/config/`** — ESLint, Stylelint, Prettier, and TypeScript configs plus the custom `lvi/*` ESLint rule set.
- **`shared/logger/`** — the `@clansocket/logger` structured logger.
- **`shared/realtime/`** — protocol types shared between server and dashboard (`RowDelta`, `DeltaBatch`, `SnapshotBaseline`, `ResumeRequest`).
- **`shared/farm/`** — farming-domain decode primitives whose shape matches the plugin protocol, consumed server-side.

`main/devlay/` is declared as a workspace in `package.json` but currently contains no source files; the dev script does not spawn it.

**Multi-tenant model.** Site-wide tables live in `clansocket.db`. Per-clan state lives under `main/server/data/clans/<clan-uuid>/` as separate SQLite files (`clan.db`, `clan_audit.db`, `clan_vault.db`, `plugin-<mode>.db`, `discord_guild_<guild_id>.db`). Plugin frames route to the right tenant via `resolveOrCreateClan`, keyed on the player's in-game clan name from the identity frame.

### Core Architectural Primitives

The system converges on a handful of single-chokepoint primitives. Each is the only sanctioned way to perform its concern, and the lint stack enforces this. When adding a feature, find the existing primitive before authoring new substrate.

| Primitive | What it owns | File |
| --- | --- | --- |
| DOM factory | Every DOM element and mutation in the dashboard | `main/dashboard/src/dom/factory/index.ts` |
| Projection-topic diff engine | Every realtime topic (clan, Discord, WoM, data-rights, Varez read scope) | `main/server/src/data-rights/streams/projection.ts` |
| Typed vault entry registry | Every per-clan encrypted credential (BYO bot, WoM, future kinds) | `main/server/src/clan-vault/registries/vault-entry-type-registry.ts` |
| Live store + liveView | Every collection-shaped realtime view in the dashboard | `main/dashboard/src/dom/factory/live-ops/{live-store,live-view}.ts` |
| Reactive signals + effect | Every reactive primitive in the dashboard | `main/dashboard/src/dom/factory/reactive.ts` |
| Factory deep-link | Every URL-affecting navigation | `main/dashboard/src/managers/deep-link.ts` |
| State persistence wrapper | Every localStorage read/write | `main/dashboard/src/state/persistence/{index,persisted-signal}.ts` |
| Clan audit recorder | Every audit-log write across the server | `main/server/src/database/clans/audit/clan-audit-helpers/record.ts` |
| Plugin telemetry router | Every plugin payload type to its projection handler | `main/server/src/database/plugin/projection/router.ts` |
| Structured logger | Every server and bot log line | `@clansocket/logger` |

---

## Install

### Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node | Recent LTS (Vite 8 + ESLint 10 + TypeScript 6 imply Node 20+) | Install via nvm or fnm. |
| npm | Bundled with Node | — |
| mkcert | Latest | Local development TLS root CA. `choco install mkcert` (Windows), `brew install mkcert` (macOS). |
| OpenSSL | Recent | Ships with Git for Windows or mkcert. Used for certificate sanity checks. |
| JDK | 11+ | Only needed if you also develop the plugin on this machine. |
| Python | 3.x | Required for `sqlfluff`, the SQL linter wired into `npm run lint:sql:fix` / `lint:sql:audit`. Install with `pip install sqlfluff`. |

### Setup

```bash
cd clansocket-app
npm install
```

`npm install` links the workspaces declared in `package.json`: `main/{discord,dashboard,devlay,electron,server}` and `shared/{farm,logger,realtime}`.

### TLS Certificates (local development only)

The server runs HTTPS on localhost by default. It can fall back to a `selfsigned` certificate, but the correct path is mkcert, which installs a real local root CA that browsers and the JVM will trust:

```bash
npm run setup:certs   # installs the mkcert root CA + issues a leaf for localhost
```

This shells out to `mkcert -install` and issues a leaf certificate for `localhost / 127.0.0.1 / ::1` into `main/server/certs/{cert,key}.pem` (see `scripts/setup/setup-local-ca-script.mjs`).

Plugin developers also need the same root CA in the JVM truststore, because Java does not read the OS trust store on Windows:

```bash
npm run trust:jvm     # imports the mkcert root into every JVM the plugin might use
```

This scans the plugin's Gradle and IntelliJ JVM configuration plus `JAVA_HOME` and imports the mkcert root into each unique `cacerts` store (see `scripts/setup/trust-mkcert-in-jvm-script.mjs`). Re-run it after any JDK upgrade or after IntelliJ adds a new project SDK. JDKs under `C:/Program Files/` require an elevated shell.

### Environment

Copy `env.template` to `.env` at the **workspace root** (`D:/BanesLab/ClanSocket/.env`), not inside `clansocket-app/`. The server reads from there: `main/server/src/index.ts` computes `REPO_ROOT = SERVER_ROOT/../..`. Read `env.template` for the live list of variables; key ones include `SERVER_PORT`, `DASHBOARD_PORT`, `BEHIND_PROXY`, the GitHub/Discord OAuth credentials, the WebAuthn relying-party variables, `CLANSOCKET_CLAN_VAULT_MASTER_KEY`, the `@ai-sdk/*` provider keys, and `API_TOKEN`. The production overlay template is `env.production.local.template`.

Production environment values live in `ecosystem.config.cjs` (the PM2 config), which is regenerated on every deploy and contains live secrets — treat it accordingly.

---

## Commands & Usage

Every script in `package.json` is a plain npm command — there is no relay layer, and chains compose with `&&`. The most common entry points also have shorter aliases on the workspace-root orchestrator (for example, the root's `npm run dev`, `npm run build`, `npm run verify`, and `npm run start:server` delegate here via `npm --prefix`).

| Command | What it does |
| --- | --- |
| `npm run dev` | Orchestrated local development: starts the server, bot, dashboard, and Electron sequentially (see below). |
| `npm run chain:verify` | Full gate: `chain:lint:fix` then `verify:prompts` then `chain:build` then `verify:fonts`. |
| `npm run chain:build` | Full build: sync auto-gen artifacts, typecheck each surface, then `vite build` into `dist/`. |
| `npm run chain:build:fast` | Same as `chain:build` with the faster dashboard bundle path. |
| `npm run start:server` | Runs the server entry under `tsx` (production-style, serves `dist/`). |
| `npm run start:discord` | Runs the bot entry under `tsx`. |
| `npm run chain:prod` | `chain:build` then `start:server`. |
| `npm run chain:package:electron` | Bakes the Electron config, runs `electron-builder --win --linux`, signs, relocates, and provisions the installer into `desktop-dist/`. |
| `npm run chain:lint:fix` | Auto-fix sweep: ESLint (all three surfaces), Stylelint, CSS scope contract, duplication audit, JSCPD, and SQL lint. |
| `npm run chain:sync:all` | Regenerates every auto-gen artifact (web routes, db semantics, table caveats, static icons). |
| `npm run verify:prompts` | Cross-prompt duplication audit over every (mode × chain-mode) prompt. |
| `npm run release:{patch,minor,major}` | Versioned release script. |

Narrower atoms exist for each surface (`lint:eslint:server`, `build:dashboard:types`, `sync:web-routes`, `map:db`, `game-ids:db`, and more) — read `package.json` for the full list.

### First Run

```bash
npm run dev
```

`scripts/dev/run-dev-script.mjs` runs sequentially, each step waiting for the previous to emit its ready log line:

1. Loads `.env` via dotenv and validates `SERVER_PORT` + `DASHBOARD_PORT`.
2. Frees those ports of any orphaned processes from prior runs.
3. Starts the Express server (`tsx main/server/src/dev.ts`) and waits for the `Server ready` log line.
4. Starts the Discord bot (`tsx --watch main/discord/src/index.ts`).
5. Starts the dashboard via Vite.
6. Starts Electron with `NODE_ENV=development` (which also enables `ignore-certificate-errors` for the dev cert).

Each child's output is prefixed with a per-process color, emoji, and ISO timestamp. SIGINT/SIGTERM and dashboard exit clean up the whole process tree. Open `https://localhost:$DASHBOARD_PORT` for the SPA with HMR, or use the Electron window. The server port returns `{"error":"frontend_not_served_in_dev"}` for non-API requests by design.

---

## Layout

High-level only. The canonical 4-axis placement doctrine (axis 1 = stable runtime, axis 2 = pure helpers, axis 3 = declarative definitions, axis 4 = build-time scripts) lives at `../clansocket-docs/CLANSOCKET/CLANSOCKET-ARCHITECTURE-ORGANIZATION.md`.

```
clansocket-app/
├── main/                       workspace packages
│   ├── discord/                Discord.js v14 bot (TypeScript ESM)
│   │   └── src/                index + base + core + handlers + plugins + loaders +
│   │                           publish-queue + outbound + state-sync + flow-api + registries
│   ├── dashboard/              Vite + TypeScript SPA
│   │   └── src/                main.ts + app + bootstrap + ai + charts + icons +
│   │       ├── dom/factory/    DOM primitives: {layout,content,data,live,seo}-ops + core
│   │       ├── dom/            feature surfaces (auth, clans, discord, data-rights, pages, ...)
│   │       ├── managers/       router + deep-link + events + header-nav managers
│   │       ├── state/          per-feature stores (state/<feature>/stores/<feature>-store.ts)
│   │       └── styles/         tokens-first plain CSS, mirrored 1:1 with dom/pages/
│   ├── devlay/                 reserved workspace (declared in package.json; no source files)
│   ├── electron/               desktop wrapper (main.js + preload.cjs + constants + prod-config)
│   └── server/                 Express server
│       └── src/                index + certs + crypto + ai + auth + clans + clan-vault +
│                               data-rights + database + discord + wom + site + plugin-api + shared
├── shared/                     cross-workspace packages
│   ├── config/                 eslint/stylelint/prettier/tsconfig + lvi/* eslint-rules
│   ├── farm/                   plugin-mirror farming-patch decode
│   ├── logger/                 @clansocket/logger
│   └── realtime/               shared protocol types (server ↔ dashboard)
├── public/                     static assets served at / (fonts, resources, sw.js, robots.txt)
├── dist/                       Vite build output (gitignored, served by Express in production)
├── desktop-dist/               electron-builder output (Windows + Linux artifacts)
├── scripts/                    concern subfolders; every script named *-script.mjs
├── ecosystem.config.cjs        PM2 config (generated each deploy; treat as live secrets)
├── env.template                workspace env var checklist
├── index.html                  Vite root HTML
└── package.json                npm scripts + workspaces
```

---

## Subsystems

Each subsystem is described at a level the README can keep current. File paths are stable; line numbers are intentionally omitted because they rot. The exhaustive per-subsystem contracts, gotchas, and ripple analysis live in `../clansocket-docs/`.

### Server Foundation

The Express + HTTP(S) bootstrap everything else mounts onto. It owns environment loading, security headers, the audit-context middleware, the HTTPS/HTTP split, the clan-vault master-key load, BYO-bot and WoM vault registration, the database lifecycle, and the plugin-api WebSocket attach. `BEHIND_PROXY=1` switches TLS off (plain HTTP) and trusts `X-Forwarded-*` in one flag. Audit context is carried through `AsyncLocalStorage`, so every nested `await` in a request can reach `requestId`, `causedBy`, and `startMs` without threading them through handlers. Router mounts (see `main/server/src/index.ts`):

| Path | Router source |
| --- | --- |
| `/api/ai/{chat,memory,persona}` | `ai/routes/` |
| `/api/auth/site` (+ `/passkey`) | `auth/site-routes/`, `auth/passkey/` |
| `/api/clans` | `clans/manage-routes/` then `clans/routes/` |
| `/api/data-rights` | `data-rights/routes/` |
| `/api/discord` | `discord/routes/` (~70 mounted sub-routers) |
| `/api/wom` | `wom/routes/` |
| `/api/me/{notifications,legacy-rsns}` | `notifications/`, `legacy-rsn/` |
| `/api/clansocket` | `plugin-api/` (HTTP metrics; WebSocket attaches separately) |
| `/api/map` | `map-assets/` |
| `/api/site` | `site/routes/` |

Plugin telemetry rides the WebSocket upgrade attached via `attachPluginApi(server)` after `server.listen`.

### Auth Flows

Every login and identity path: GitHub and Discord OAuth, account claim (linking an in-game RSN to a site account via a plugin handshake), sessions, WebAuthn passkeys (register, authenticate, link, recover), device-link codes, backup codes, step-up freshness, and the bot bearer token. Sessions are rows in `clansocket_oauth_sessions` with a 30-day TTL and no refresh tokens. Two unrelated `authenticate` concepts coexist: a bearer-token check for the Discord bridge (using `API_TOKEN`), and `requireSiteAccount` for every user-facing route. Step-up freshness is held in process memory with a 5-minute TTL, so a PM2 reload clears it for everyone. Entry points: `auth/site-routes/`, `auth/site-middleware.ts`, `auth/site-session.ts`, `auth/passkey/handlers/`.

### Plugin API, Telemetry & Audit

The WebSocket endpoint and ingest pipeline the RuneLite plugin streams into. It resolves tenancy (`clanId = resolveOrCreateClan(msg.clanName)` from the identity frame), dispatches per payload type, deduplicates by content hash, and writes a hash-chained audit log per clan. A four-condition telemetry gate (authentication, clan status and verification, identity freshness within 600s, and login state) must hold before any DB write. Rate limiting is a per-socket token bucket; backpressure terminates sockets over a 1 MiB buffer; at most two sockets per account hash are kept. Every `type:` literal in `plugin-api/types/client-telemetry.ts` must resolve to a handler in the projection router, enforced by `lvi/no-unrouted-telemetry`. Entry points: `plugin-api/`, `database/plugin/projection/router.ts`.

### Clan Lifecycle

Every flow from clan birth to termination: registration via the plugin identity frame, the claim handshake binding an account to in-game OWNER rank, manager request and approval, branding upload, whitelists, auth tokens, hard delete, data-rights export (user and clan), leave-site, and the dead-clan sweep. Per-clan database directories are lazy — created on the first telemetry write. The dead-clan sweep is request-driven, not scheduled: it fires only when a manager opens `/api/me/notifications/`, because `lvi/no-timer-heuristic` bans server-side polling timers. Audit actions are enumerated at `database/clans/audit/clan-audit-actions.ts`. Entry points: `clans/routes/`, `data-rights/`, `database/clans/`.

### AI (Varez)

The in-platform AI persona for clan operators: a server-side chain loop, prompt store, memory store, and persona store, with a dashboard SSE consumer and a Discord-bot bridge so users can mention Varez in Discord. It is multi-provider via the `@ai-sdk/*` packages, with provider keys from the environment. The chain loop is either reactive (ends when the model emits `chain:false`) or continuous (the server forces `chain:true` when a user message is queued mid-flight). Prompts are TypeScript sources under `ai/prompts/`, split by concern; auto-generated artifacts regenerate via `npm run sync:*`. Database queries are SELECT-only with row caps. Entry points: `ai/routes/`, `ai/chain/`, `ai/persona/`, `ai/memory/`, `ai/lifecycle/`.

### Discord Bot

A Discord.js v14 client running as a separate Node process. A plugin auto-loader walks `src/plugins/{commands,slash,interactions,messages}/` and binds each module by its `type`. The bot talks to the server over HTTP REST for persistence and consumes SSE over the projection bus for `discord_*` table events; it never opens a WebSocket or an inbound port. The substantial Discord-as-management-platform surface (auto-hooks, BYO-bot lifecycle, draft and publish-queue dependency graphs) lives server-side under `main/server/src/discord/` with dashboard UI under `dom/pages/clans/manage/discord/`. Entry points: `main/discord/src/index.ts`, `core/`, `handlers/`, `loaders/`, `publish-queue/`, `flow-api/`.

### Dashboard

A Vite + TypeScript SPA with no framework. Routing is split between `managers/router/` (full page swaps via a `defineRoute` registry) and `managers/deep-link.ts` (overlay-scoped parallel listeners on `popstate`). Application events flow through `managers/events.ts`. State lives at `state/<feature>/` with `stores/`, `<feature>-client/`, and feature-specific subfolders. The design system is canonical under `../clansocket-docs/DASHBOARD/`. The AI bar is a flex child (never `position:fixed`), the route host is the scroll container, and history is virtualized — these are load-bearing for paint performance. Entry points: `main.ts`, `app/`, `managers/router/`, `dom/factory/index.ts`.

### WoM (Wise Old Man) Integration

Wise Old Man is the open-source OSRS hiscores tracker. ClanSocket links a clan's WoM group as a typed vault credential (`entry_key = "wom"`), then backfills per-player telemetry from WoM into the same per-clan `plugin_*` tables the plugin writes — covering mobile-only members the plugin cannot observe. The plugin always wins for plugin-fed fields; WoM fills gaps and tracks name changes. Provenance is tracked per writable column via `<col>_source` and `<col>_updated_at`, with MAX-wins semantics on metric values. A server-side outbound queue enforces per-tenant rate windows. Entry points: `wom/`, `database/wom/`, `state/wom/`.

### Electron Desktop Wrapper

A thin wrapper that loads the dashboard URL in a frameless BrowserWindow with `contextIsolation` enabled and `nodeIntegration` disabled. The dashboard renders its own title-bar chrome and drives window controls over IPC. Development mode enables `ignore-certificate-errors` for the self-signed dev cert (gated strictly on `NODE_ENV=development`). Production builds ship date-stamped and rolling-`latest` Windows and Linux artifacts into `desktop-dist/`.

### Databases

SQLite, multiple files: site-wide, per-clan, and per-clan-mode. All schemas apply unconditionally every boot via `IF NOT EXISTS` DDL. The pre-launch doctrine is no migration ledger and no down-migrations — databases delete and recreate from `database/schemas/<kind>/*.sql` on demand.

| Path (under `main/server/data/`) | Role |
| --- | --- |
| `clansocket.db` | Site-wide: auth, clan registry, manager grants, whitelists, notifications, account-hash bindings, user profile. |
| `discord_bot.db` | Discord bot operational state and clan↔guild routing. |
| `discord_rate_limits.db` | Per-route and global rate-limit buckets. |
| `varez.db` | Varez AI state, chat history, chain turns, pins. |
| `clans/<uuid>/clan.db` | Per-clan telemetry and management (rosters, members, settings, WoM identity). |
| `clans/<uuid>/clan_audit.db` | Per-clan tamper-evident audit chain. |
| `clans/<uuid>/clan_vault.db` | Per-clan encrypted credentials (requires `CLANSOCKET_CLAN_VAULT_MASTER_KEY`). |
| `clans/<uuid>/discord_guild_<guild_id>.db` | Per-clan-per-guild Discord config, drafts, presets. |
| `clans/<uuid>/plugin-<mode>.db` | Per-clan plugin telemetry per game mode (combat, XP, drops, collection log, and more). |

Static catalog databases (`data/map/world_map.db`, `data/game_ids.db`) are built offline from `extracted-cache-assets` via `npm run map:db` and `npm run game-ids:db`. Table prefixes are locked to `{plugin, clansocket, discord, varez, clan}_*`; new prefixes or db kinds require explicit authorization. Every telemetry row satisfies the Who / What / Where / When doctrine, audited by `scripts/audit/audit-schema-doctrine-script.mjs`. For any new SQLite access, use the `database/core/` primitives (`getDb` / `getStaticDb` / per-tenant accessors) — never construct a `Database` and roll your own cache in a feature folder.

---

## Conventions & Strictness

This codebase is stricter than the average Node monorepo. The canonical rule enumeration (Development, Design, and Architecture sections, roughly 200 rules) lives at `../clansocket-docs/CLANSOCKET/CLANSOCKET-DEV-RULES.md`. The highlights:

- **Three ESLint configs, passed via `--config`.** `eslint.{discord,dashboard,server}.config.js` under `shared/config/`. The server config is the strictest; the dashboard config adds factory-chokepoint rules. Plain `eslint` will not pick these up.
- **No heuristic timers.** `lvi/no-timer-heuristic` errors on `setInterval`/`setTimeout` in any file linted by the server or bot config. Scheduling must be event-triggered with a `Date.now()` gate against a canonical timestamp. Whole-file exemptions live in `no-timer-heuristic.exclusions.cjs` with a reason; inline disables are rejected.
- **No regex.** `lvi/no-regex` bans all regex literals. Parsers walk characters manually.
- **No exclusions — fix in source.** Never silence a lint, build, or verify failure with inline disables, `@ts-ignore`, or exclusion lists. Fix the underlying violation.
- **No comments in source.** `lvi/no-comments` bans `//` and `/* */` on `.ts` source, preserving only `eslint-*`/`@ts-*` directives and shebangs.
- **File and folder limits.** 150 lines per file, 6 files per folder (split by concern when you hit the cap — never merge files to dodge it), `max-params: 4`, `max-depth: 3`, 3-5 word identifier names.
- **Single-concern enforcement.** `lvi/no-mixed-concerns` clusters identifier tokens with TF-IDF and fails files spanning more than two concerns. The role name `helper` is banned; there are no `helpers/` folders.
- **Pre-launch — no compatibility shims.** ClanSocket has no external consumers. Make direct, finalized changes instead of writing deprecation layers or soft migrations.

The dashboard design system is canonical under `../clansocket-docs/DASHBOARD/`. Raw hex colors appear only in `main/dashboard/src/styles/tokens/colors/`; everything else binds via `var(--…)`. Feature code never calls `createElement` — it reaches for `dom/factory/<category>-ops/`.

---

## Gotchas & Invariants

- **`.env` lives at the workspace root**, not in `clansocket-app/`. The server computes `REPO_ROOT` two levels up from the server folder.
- **WebSocket upgrades bypass `express.json` and the audit-context middleware**, so plugin-api WebSocket handlers have no audit-context store available.
- **`BEHIND_PROXY=1` skips certificate generation entirely** — the production droplet behind nginx never generates certs.
- **The `cs_session` cookie's `secure` flag depends on `x-forwarded-proto`.** Drop that header at the proxy and cookies stop working in production.
- **WAL mode is set per connection.** Backups must include the `.db-wal` and `.db-shm` sidecar files, or use SQLite's online backup API.
- **The dead-clan sweep is request-driven.** A clan whose manager never opens the dashboard is never warned or purged. This is intentional.
- **`PRAGMA foreign_keys = ON` is set per connection.** Connections opened outside the `database/core` module default to off.
- **`sqlite3@^6` is declared in dependencies but unused in `main/`** — `better-sqlite3` is the only SQLite library imported.

---

## Troubleshooting

- **`PKIX path building failed` from the plugin to the server.** The JVM does not trust the served certificate. Confirm the server is serving the mkcert leaf (not the `selfsigned` fallback) with `openssl s_client`, run `npm run setup:certs` if not, then ensure the mkcert root is in the JVM truststore with `npm run trust:jvm` (elevated shell if the JDK is under `C:/Program Files/`).
- **The server keeps regenerating `selfsigned` certs.** `ensureCerts()` regenerates whenever `main/server/certs/` is missing or fails validation. Re-run `npm run setup:certs`.
- **A development port collision.** The launcher auto-frees `SERVER_PORT`, `DASHBOARD_PORT`, and `DEVLAY_PORT` before spawning. If cleanup misses a process, kill it manually.
- **ESLint config not picked up.** ESLint configs require `--config`. Use `npm run chain:lint:fix` or a per-surface atom, or pass `--config shared/config/eslint.<surface>.config.js`.
- **A Varez provider key is missing.** A missing `@ai-sdk/*` provider key surfaces as a provider-specific error in the chat SSE stream. Set the relevant variable and restart the server.
- **The clan vault master key is not loaded.** The server logs a warning at boot and starts anyway, but vault operations fail until `CLANSOCKET_CLAN_VAULT_MASTER_KEY` is set and the server is restarted.
- **Ad-hoc database inspection.** Use the workspace SQLite CLI at `../claude-tools/db.mjs` (read-only by default). Never use the `sqlite3` CLI or a throwaway `better-sqlite3` script.

---

## Where to Find Things

| Topic | Document |
| --- | --- |
| Doctrine routing hub | `../clansocket-docs/INDEX.md` |
| Enforced dev / design / architecture rules | `../clansocket-docs/CLANSOCKET/CLANSOCKET-DEV-RULES.md` |
| 4-axis file placement + role registry | `../clansocket-docs/CLANSOCKET/CLANSOCKET-ARCHITECTURE-ORGANIZATION.md` |
| Documentation method | `../clansocket-docs/CLANSOCKET/CLANSOCKET-DOCUMENTATION-METHOD.md` |
| Dashboard design system | `../clansocket-docs/DASHBOARD/` |
| RuneLite plugin compliance | `../clansocket-docs/PLUGIN/RUNELITE/RUNELITE-PLUGIN-GUIDELINES.md` |
| Varez voice, scope, and persona | `../clansocket-docs/VAREZ/VAREZ-SCOPE.md` |
| Ongoing handoffs | `../clansocket-docs/ONGOING/` |
| Workspace-root command surface | `../package.json` |
| Ad-hoc SQLite CLI | `../claude-tools/db.mjs` |
