// B3: runtime cache-first for /assets/* (hashed JS / CSS / image / font bundles),
// network-first for everything else. Hashed asset filenames mean content
// addresses — once we have a hash in cache, it's immutably correct. We never
// need to revalidate hashed assets.
//
// Cache key is versioned so a SW upgrade evicts old asset caches cleanly.

const CACHE_VERSION = "v2";
const ASSETS_CACHE = `clansocket-assets-${CACHE_VERSION}`;
const ASSET_PATH_RE = /\/assets\/[^/]+\.(?:js|css|woff2?|png|webp|svg|ico|gif|jpg|jpeg|ktx2|avif)$/;
const RESOURCES_PATH_PREFIX = "/resources/";

// MIME type matchers per URL extension. A response is only cacheable when its
// Content-Type matches the prefix expected for the URL's extension — this blocks
// the SPA-fallback HTML poisoning (when an old hashed URL 404s on origin and
// nginx ships index.html with status 200 + text/html, that response must NEVER
// land in the asset cache under the JS/CSS URL).
const MIME_BY_EXTENSION = {
    js: ["application/javascript", "text/javascript", "application/ecmascript"],
    css: ["text/css"],
    woff: ["font/woff", "application/font-woff"],
    woff2: ["font/woff2", "application/font-woff2"],
    png: ["image/png"],
    webp: ["image/webp"],
    svg: ["image/svg+xml"],
    ico: ["image/x-icon", "image/vnd.microsoft.icon"],
    gif: ["image/gif"],
    jpg: ["image/jpeg"],
    jpeg: ["image/jpeg"],
    ktx2: ["image/ktx2", "application/octet-stream"],
    avif: ["image/avif"],
};

function extensionOf(pathname) {
    const dot = pathname.lastIndexOf(".");
    if (dot < 0) return null;
    return pathname.slice(dot + 1).toLowerCase();
}

function mimeMatchesExtension(contentType, ext) {
    if (contentType === null) return false;
    const expected = MIME_BY_EXTENSION[ext];
    if (expected === undefined) return true;
    const lower = contentType.toLowerCase();
    for (const candidate of expected) {
        if (lower.startsWith(candidate)) return true;
    }
    return false;
}

self.addEventListener("install", (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        // Evict any caches NOT matching the current version.
        const names = await caches.keys();
        await Promise.all(
            names
                .filter((n) => n !== ASSETS_CACHE)
                .map((n) => caches.delete(n)),
        );
        await self.clients.claim();
    })());
});

function isCacheable(url) {
    if (url.origin !== self.location.origin) return false;
    // Hashed Vite bundles in /assets/ — content-addressed, immutably cacheable.
    if (ASSET_PATH_RE.test(url.pathname)) return true;
    // Static resources (tile images, sprites, fonts) — cacheable.
    if (url.pathname.startsWith(RESOURCES_PATH_PREFIX)) return true;
    return false;
}

self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;
    const url = new URL(req.url);
    if (!isCacheable(url)) return;
    event.respondWith((async () => {
        const cache = await caches.open(ASSETS_CACHE);
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
            const fresh = await fetch(req);
            // Only cache successful responses whose Content-Type matches the URL
            // extension. This blocks SPA-fallback poisoning: when an old hashed
            // chunk URL 404s on origin and nginx returns index.html with status
            // 200 + text/html, that response would otherwise be cached under the
            // JS/CSS URL and break every subsequent load until the cache evicts.
            if (fresh.ok && fresh.status === 200) {
                const ext = extensionOf(url.pathname);
                const contentType = fresh.headers.get("content-type");
                if (ext === null || mimeMatchesExtension(contentType, ext)) {
                    // Clone before caching — the response body is a one-shot
                    // stream; we need one for the cache and one for the page.
                    cache.put(req, fresh.clone()).catch(() => undefined);
                }
            }
            return fresh;
        } catch (err) {
            // Network failure + nothing in cache — re-throw so the page sees
            // the failure (no opaque silent fallback).
            throw err;
        }
    })());
});
