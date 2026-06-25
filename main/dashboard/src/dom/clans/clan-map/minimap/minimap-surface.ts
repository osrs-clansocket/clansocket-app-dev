import { scratchCanvas } from "../../../factory/content-ops";
import { image } from "../../../factory/content-ops/graphics/media.js";
import { effect, type ReadSignal } from "../../../factory/reactive/index.js";
import type { Instance } from "../../../factory/core";
import {
    MAP_MINIMAP_BG_CLASS,
    MAP_MINIMAP_OVERLAY_CLASS,
} from "../../../../shared/constants/clan/clan-map-constants.js";
import { MINIMAP_H, MINIMAP_W } from "./minimap-dimensions.js";
import { previewUrl } from "./minimap-preview-url.js";

function buildMinimapBg(activePlane$: ReadSignal<number>): Instance<HTMLImageElement> {
    const bg = image({
        src: previewUrl(activePlane$()),
        width: MINIMAP_W,
        height: MINIMAP_H,
        alt: "world map preview",
        classes: [MAP_MINIMAP_BG_CLASS],
        lazy: false,
        context: null,
        meta: null,
    });
    bg.trackDispose(
        effect(() => {
            bg.el.src = previewUrl(activePlane$());
        }),
    );
    return bg;
}

export function buildMinimapSurface(activePlane$: ReadSignal<number>): {
    bg: Instance<HTMLImageElement>;
    overlay: Instance<HTMLCanvasElement>;
} {
    const bg = buildMinimapBg(activePlane$);
    const overlay = scratchCanvas({
        width: MINIMAP_W,
        height: MINIMAP_H,
        classes: [MAP_MINIMAP_OVERLAY_CLASS],
        context: null,
        meta: null,
    });
    return { bg, overlay };
}
