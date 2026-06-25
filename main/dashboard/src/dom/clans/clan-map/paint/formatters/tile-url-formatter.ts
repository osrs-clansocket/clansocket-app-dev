import { memoize } from "../../../../../state/caches/memoize.js";

export type TileRoot = "tiles" | "tiles-merged";

let currentRoot: TileRoot = "tiles";

export function setTileRoot(root: TileRoot): void {
    if (currentRoot !== root) {
        currentRoot = root;
    }
}

export function getTileRoot(): TileRoot {
    return currentRoot;
}

interface TileUrlArgs {
    plane: number;
    zoom: number;
    tx: number;
    ty: number;
    root: TileRoot;
}

const tileUrlImpl = (a: TileUrlArgs): string =>
    `/resources/osrs/image_world_map/${a.root}/${a.plane}/z${a.zoom}/${a.tx}/${a.ty}.webp`;

const memoizedTileUrl = memoize(tileUrlImpl, {
    tag: "clan-map",
    maxEntries: 2048,
    keyOf: (a) => `${a.root}|${a.plane}:${a.zoom}:${a.tx}:${a.ty}`,
});

export function tileUrl(plane: number, zoom: number, tx: number, ty: number): string {
    return memoizedTileUrl({ plane, zoom, tx, ty, root: currentRoot });
}
