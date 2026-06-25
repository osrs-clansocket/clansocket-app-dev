import type { AtlasBox } from "../../../../shared/types/view-types.js";
import { zoomViewportAround } from "../paint/calculators/viewport-calculator.js";
import { zoomBounds, zoomCenteredOn } from "./viewport-zoom-centered.js";

interface ZoomAnchorOpts {
    viewport: AtlasBox;
    factor: number;
    anchorAtlasX: number;
    anchorAtlasY: number;
    followAtlasPoint: { ax: number; ay: number } | null;
    centerOnAnchor?: boolean;
}

export function nextAnchor(opts: ZoomAnchorOpts): { next: AtlasBox; followed: boolean } {
    const { viewport, factor, anchorAtlasX, anchorAtlasY, followAtlasPoint, centerOnAnchor } = opts;
    const { minDim, maxDim } = zoomBounds();
    if (followAtlasPoint !== null) {
        const { ax, ay } = followAtlasPoint;
        return { next: zoomCenteredOn({ viewport, ax, ay, factor, minDim, maxDim }), followed: true };
    }
    if (centerOnAnchor === true) {
        return {
            next: zoomCenteredOn({ viewport, factor, minDim, maxDim, ax: anchorAtlasX, ay: anchorAtlasY }),
            followed: false,
        };
    }
    return {
        next: zoomViewportAround({ viewport, anchorAtlasX, anchorAtlasY, factor, minDim, maxDim }),
        followed: false,
    };
}
