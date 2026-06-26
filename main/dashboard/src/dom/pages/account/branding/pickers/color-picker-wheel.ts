import type { Instance } from "../../../../factory/index.js";

export function wireWheelScroll(swatchGrid: Instance): void {
    swatchGrid.el.addEventListener(
        "wheel",
        (e) => {
            if (e.deltaY === 0) return;
            const before = swatchGrid.el.scrollLeft;
            swatchGrid.el.scrollLeft = before + e.deltaY;
            if (swatchGrid.el.scrollLeft !== before) e.preventDefault();
        },
        { passive: false },
    );
}
