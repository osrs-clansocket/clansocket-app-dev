import { AppRoutes } from "../../../managers/router/types.js";
import type { RouteSeoData } from "../../../managers/router/types.js";
import { matchClanPath, clanSlug } from "../../../managers/router/slug-paths.js";
import { defineRoute } from "../../../managers/router/registry.js";
import { AsyncMemoCache } from "../../../state/caches/async-memo-cache.js";

const TEN_MINUTES_MS = 10 * 60 * 1000;
const seoCache = new AsyncMemoCache<string, RouteSeoData | null>({
    tag: "clan-state",
    maxEntries: 32,
    ttlMs: TEN_MINUTES_MS,
});

function lookupOrFetch(slug: string): Promise<RouteSeoData | null> {
    return seoCache.getOrLoad(slug, async () => {
        const { clansClient } = await import("../../../state/clans/clans-client/index.js");
        return clansClient.fetchClanSeo(slug);
    });
}

defineRoute({
    path: AppRoutes.CLAN,
    match: matchClanPath,
    description: "A clan's dashboard. :slug is the clan's lowercase slug.",
    example: "/clans/varietyz",
    seo: async (path) => {
        const slug = clanSlug(path);
        if (slug.length === 0) return null;
        return lookupOrFetch(slug);
    },
    render: async (path) => (await import("../../pages/clans/home/render-clan-home.js")).renderClanHome(path),
});
