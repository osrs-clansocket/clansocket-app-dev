import { BoundedCache } from "../../../../../state/caches/bounded-cache.js";
import { tileUrl } from "../formatters/tile-url-formatter.js";
import { tileExists } from "../validators/tile-existence-validator.js";

const MAX_CACHE_ENTRIES = 256;

const BLANK_DATA_URI = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";

export type TileCache = BoundedCache<string, HTMLImageElement>;

export function createTileCache(): TileCache {
    return new BoundedCache<string, HTMLImageElement>({
        tag: "clan-map",
        maxEntries: MAX_CACHE_ENTRIES,
        evictionPolicy: "lru",
        onEvict: (_url, img) => {
            try {
                img.src = BLANK_DATA_URI;
            } catch {
                void 0;
            }
        },
    });
}

interface EnsureTileOpts {
    plane: number;
    zoom: number;
    tx: number;
    ty: number;
    cache: TileCache;
    onReady: () => void;
}

type FetchPriorityImage = HTMLImageElement & { fetchPriority?: "auto" | "high" | "low" };

function decodeThen(img: HTMLImageElement, onReady: () => void): void {
    const p = img.decode === undefined ? Promise.resolve() : img.decode().catch(() => undefined);
    p.then(onReady);
}

function loadNewTile(url: string, onReady: () => void, priority: "high" | "low"): HTMLImageElement {
    const img: FetchPriorityImage = new Image();
    img.decoding = "async";
    img.fetchPriority = priority;
    img.src = url;
    img.addEventListener("load", () => decodeThen(img, onReady), { once: true });
    return img;
}

export function ensureTile({ plane, zoom, tx, ty, cache, onReady }: EnsureTileOpts): HTMLImageElement {
    const url = tileUrl(plane, zoom, tx, ty);
    const existing = cache.get(url);
    if (existing) {
        if (!existing.complete) {
            existing.addEventListener("load", () => decodeThen(existing, onReady), { once: true });
        }
        return existing;
    }
    if (!tileExists(plane, zoom, tx, ty)) {
        const placeholder = new Image();
        cache.set(url, placeholder);
        return placeholder;
    }
    const img = loadNewTile(url, onReady, "high");
    cache.set(url, img);
    return img;
}

function cachePlaceholder(url: string, cache: TileCache): void {
    const placeholder = new Image();
    cache.set(url, placeholder);
}

export interface PrefetchTileArgs {
    plane: number;
    zoom: number;
    tx: number;
    ty: number;
    cache: TileCache;
}

export function prefetchTile(args: PrefetchTileArgs): Promise<void> {
    const { plane, zoom, tx, ty, cache } = args;
    const url = tileUrl(plane, zoom, tx, ty);
    if (cache.has(url)) return Promise.resolve();
    if (!tileExists(plane, zoom, tx, ty)) {
        cachePlaceholder(url, cache);
        return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
        const img: FetchPriorityImage = new Image();
        img.decoding = "async";
        img.fetchPriority = "low";
        img.addEventListener(
            "load",
            () => {
                if (img.decode !== undefined) void img.decode().catch(() => undefined);
                resolve();
            },
            { once: true },
        );
        img.addEventListener("error", () => resolve(), { once: true });
        img.src = url;
        cache.set(url, img);
    });
}
