import type { Instance } from "../../../../factory";
import type { QuipSet } from "./quip-types.js";
import { measureQuipSize } from "./measurers/block-size-measurer.js";

export function lockQuipSize(quipEl: Instance, quipSet: QuipSet): void {
    if (!quipEl.el.isConnected) return;
    const maxH = measureQuipSize(quipEl.el, quipSet);
    if (maxH > 0) quipEl.el.style.blockSize = `${maxH}px`;
}
