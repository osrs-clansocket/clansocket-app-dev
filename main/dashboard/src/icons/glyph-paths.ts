import "./families";
import { AsyncMemoCache } from "../state/caches/async-memo-cache.js";
import { iconFamily } from "./registry";

export interface GlyphPath {
    d: string;
    advance: number;
}

type GlyphPathMap = Record<string, GlyphPath>;

const pathCache = new AsyncMemoCache<string, GlyphPathMap>({
    tag: "icons",
    maxEntries: 7,
});

export async function loadGlyphPath(provider: string, name: string): Promise<GlyphPath | null> {
    const family = iconFamily(provider);
    if (family === undefined || family.pathsLoader === undefined) return null;
    const loader = family.pathsLoader;
    const map = await pathCache.getOrLoad(provider, () => loader() as Promise<GlyphPathMap>);
    return map[name] ?? null;
}

export function isVectorProvider(provider: string): boolean {
    const f = iconFamily(provider);
    return f !== undefined && f.pathsLoader !== undefined;
}
