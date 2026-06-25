// B3: runtime cache-first for /assets/* (hashed JS / CSS / image / font bundles),
// network-first for everything else. Hashed asset filenames mean content
// addresses — once we have a hash in cache, it's immutably correct. We never
// need to revalidate hashed assets.
//
// Cache key is versioned so a SW upgrade evicts old asset caches cleanly.

const CACHE_VERSION = "v1";
const ASSETS_CACHE = `clansocket-assets-${CACHE_VERSION}`;
const ASSET_PATH_RE = /\/assets\/[^/]+\.(?:js|css|woff2?|png|webp|svg|ico|gif|jpg|jpeg|ktx2|avif)$/;
const RESOURCES_PATH_PREFIX = "/resources/";

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
            // Only cache successful responses. Errors/redirects fall through.
            if (fresh.ok && fresh.status === 200) {
                // Clone before caching — the response body is a one-shot
                // stream; we need one for the cache and one for the page.
                cache.put(req, fresh.clone()).catch(() => undefined);
            }
            return fresh;
        } catch (err) {
            // Network failure + nothing in cache — re-throw so the page sees
            // the failure (no opaque silent fallback).
            throw err;
        }
    })());
});
