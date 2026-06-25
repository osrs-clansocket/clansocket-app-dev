import { scratchCanvas } from "../../../factory/content-ops";
import {
    DEFAULT_H,
    DEFAULT_W,
    MAP_BG_CLASS,
    MAP_OVERLAY_CLASS,
} from "../../../../shared/constants/clan/clan-map-constants.js";
import type { MountedRefs } from "./index-bindings.js";

export function buildMapCanvases(): MountedRefs {
    const bg = scratchCanvas({
        width: DEFAULT_W,
        height: DEFAULT_H,
        classes: [MAP_BG_CLASS],
        context: null,
        meta: null,
    });
    const overlay = scratchCanvas({
        width: DEFAULT_W,
        height: DEFAULT_H,
        classes: [MAP_OVERLAY_CLASS],
        context: null,
        meta: null,
    });
    return { bg, overlay };
}
