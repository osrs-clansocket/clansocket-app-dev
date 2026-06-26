// Dev-mode middleware that mirrors the production nginx posture from
// clansocket-deploy/nginx/sites-available/clansocket.template. Catches prod-breaking
// patterns in dev (mixed-content fetches, CSP connect-src violations, missing
// Cross-Origin headers) and produces audit numbers (compression, headers) that
// parity with production Lighthouse runs.
//
// CSP approach: nonce-based (mirrors prod). A fixed dev nonce is injected into
// every <script> and <link rel="modulepreload"> tag via transformIndexHtml (post-order
// so vite's own injections — @vite/client, HMR preamble — get nonced too). The CSP
// header references that same nonce. With 'strict-dynamic', nonced scripts can
// dynamically load other modules (vite's main.ts → app imports) without each one
// needing a nonce of its own.
//
// Per-route header parity:
//   - All HTML responses: Cache-Control no-cache (matches SPA shell, enables bfcache).
//   - /fonts/ requests: Cross-Origin-Resource-Policy cross-origin + Access-Control-Allow-Origin *
//     (matches nginx /fonts/ block).
//   - All others: Cross-Origin-Resource-Policy same-origin (default).
//   - Server header overridden to "ClanSocket Platform" (matches more_set_headers).
//   - X-Powered-By stripped defensively if set by upstream.
//
// Differences from prod (documented intentional gaps):
//   - Fixed dev nonce vs nginx's per-request $request_id. Per-request rotation requires
//     propagating the nonce from middleware to transformIndexHtml — needs AsyncLocalStorage
//     or url-keyed maps for zero security gain on localhost.
//   - script-src adds 'unsafe-eval' for vite HMR module-boundary patching (prod omits).
//   - connect-src adds ws/wss/https://localhost:* for vite HMR.
//   - style-src includes 'unsafe-inline' for inline style="" attributes the factory emits.
//   - No SRI integrity= attributes (vite-dev modules have no stable hashes).
//   - No /assets/ immutable Cache-Control (would break HMR).
//   - No /_errors/* stricter CSP (handled by separate clansocket-errors deploy).
//
// What this catches (the real prod-blocking patterns):
//   - any mixed-content fetch (https vs http)
//   - any connect-src/img-src/font-src violation against the explicit allowlist
//   - frame-ancestors, base-uri, form-action violations
//   - missing Cross-Origin-* headers that would change browser behavior
//   - inline <script> tags WITHOUT a nonce in any HTML
//   - inline event handlers (onclick="" etc.)
//   - bfcache eligibility (via Cache-Control no-cache on HTML)
//
// What it doesn't catch (use a prod build audit for these):
//   - eval() in app code (covered by 'unsafe-eval' in dev only)
//   - inline style="" attributes (covered by style-src 'unsafe-inline' in dev only)

import zlib from "node:zlib";

const BROTLI_TYPES = new Set([
    "text/plain",
    "text/css",
    "text/xml",
    "text/html",
    "application/javascript",
    "application/json",
    "application/xml",
    "application/xml+rss",
    "application/manifest+json",
    "image/svg+xml",
]);

const BROTLI_QUALITY = 5;
const BROTLI_MIN_BYTES = 256;

const DEV_NONCE = "dev-csp-nonce";

const HSTS = "max-age=63072000; includeSubDomains; preload";
const PERMISSIONS_POLICY =
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()";

const SERVER_BRAND = "ClanSocket Platform";

function buildDevCsp() {
    return [
        "default-src 'none'",
        `script-src 'nonce-${DEV_NONCE}' 'strict-dynamic' 'unsafe-eval'`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: https://cdn.discordapp.com",
        "font-src 'self' data:",
        "connect-src 'self' ws://localhost:* wss://localhost:* https://localhost:* https://www.google-analytics.com https://*.analytics.google.com https://stats.g.doubleclick.net",
        "worker-src 'self' blob:",
        "manifest-src 'self'",
        "media-src 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join("; ");
}

function isFontPath(url) {
    return typeof url === "string" && url.startsWith("/fonts/");
}

function isProxiedApi(url) {
    return typeof url === "string" && url.startsWith("/api/");
}

function isHtmlResponse(res) {
    const ct = res.getHeader("content-type");
    if (typeof ct !== "string") return false;
    return ct.split(";")[0].trim().toLowerCase() === "text/html";
}

function setSecurityHeaders(req, res) {
    res.setHeader("Server", SERVER_BRAND);
    res.removeHeader("X-Powered-By");
    res.setHeader("Strict-Transport-Security", HSTS);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    res.setHeader("X-XSS-Protection", "0");
    res.setHeader("Permissions-Policy", PERMISSIONS_POLICY);
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    res.setHeader("Content-Security-Policy", buildDevCsp());
    if (isFontPath(req.url)) {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Access-Control-Allow-Origin", "*");
    } else {
        res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    }
}

function maybeSetCacheControl(res) {
    if (isHtmlResponse(res)) {
        res.setHeader("Cache-Control", "no-cache");
    }
}

function acceptsBrotli(req) {
    const enc = req.headers["accept-encoding"];
    return typeof enc === "string" && enc.includes("br");
}

function compressibleType(contentType) {
    if (typeof contentType !== "string") return false;
    const base = contentType.split(";")[0].trim().toLowerCase();
    return BROTLI_TYPES.has(base);
}

function wireBrotli(res) {
    const origWriteHead = res.writeHead.bind(res);
    const origWrite = res.write.bind(res);
    const origEnd = res.end.bind(res);

    let compress = null;
    let bypass = false;
    let initialized = false;
    let bufferedHead = null;

    function maybeInit() {
        if (initialized) return;
        initialized = true;
        maybeSetCacheControl(res);
        const contentType = res.getHeader("content-type");
        if (!compressibleType(contentType)) {
            bypass = true;
            return;
        }
        if (res.getHeader("content-encoding")) {
            bypass = true;
            return;
        }
        const len = res.getHeader("content-length");
        if (typeof len === "string" || typeof len === "number") {
            if (Number(len) < BROTLI_MIN_BYTES) {
                bypass = true;
                return;
            }
        }
        compress = zlib.createBrotliCompress({
            params: { [zlib.constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY },
        });
        res.removeHeader("content-length");
        res.setHeader("content-encoding", "br");
        compress.on("data", (chunk) => origWrite(chunk));
        compress.on("end", () => origEnd());
        if (bufferedHead) {
            origWriteHead(...bufferedHead);
            bufferedHead = null;
        }
    }

    res.writeHead = function patchedWriteHead(...args) {
        if (initialized) return origWriteHead(...args);
        bufferedHead = args;
        return res;
    };

    res.write = function patchedWrite(chunk, ...rest) {
        maybeInit();
        if (bypass) {
            if (bufferedHead) {
                origWriteHead(...bufferedHead);
                bufferedHead = null;
            }
            return origWrite(chunk, ...rest);
        }
        return compress.write(chunk);
    };

    res.end = function patchedEnd(chunk, ...rest) {
        maybeInit();
        if (bypass) {
            if (bufferedHead) {
                origWriteHead(...bufferedHead);
                bufferedHead = null;
            }
            return origEnd(chunk, ...rest);
        }
        if (chunk) compress.write(chunk);
        return compress.end();
    };
}

function injectNonces(html) {
    return html
        .replace(/<script\b(?![^>]*\bnonce=)/g, `<script nonce="${DEV_NONCE}"`)
        .replace(/<link\s+rel="modulepreload"(?![^>]*\bnonce=)/g, `<link rel="modulepreload" nonce="${DEV_NONCE}"`);
}

export default function devParityPlugin() {
    return {
        name: "dev-prod-parity",
        apply: "serve",
        transformIndexHtml: {
            order: "post",
            handler(html) {
                return injectNonces(html);
            },
        },
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                setSecurityHeaders(req, res);
                if (isProxiedApi(req.url)) {
                    next();
                    return;
                }
                if (acceptsBrotli(req)) wireBrotli(res);
                else maybeSetCacheControl(res);
                next();
            });
        },
    };
}
