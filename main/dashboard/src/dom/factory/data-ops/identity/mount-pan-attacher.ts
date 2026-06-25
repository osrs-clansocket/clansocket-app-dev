import type { Instance } from "../../core";
import type { VoxlabRenderer } from "../../../../managers/voxlab/app/voxlab-renderer.js";

const MOBILE_PAN_QUERY = "(width <= 48rem)";

export function attachMountPan(hostInst: Instance, renderer: VoxlabRenderer, panX: number): void {
    const mq = window.matchMedia(MOBILE_PAN_QUERY);
    const applyPan = (): void => {
        renderer.setHorizontalPan(mq.matches ? panX : 0);
    };
    applyPan();
    mq.addEventListener("change", applyPan);
    hostInst.trackDispose({ dispose: () => mq.removeEventListener("change", applyPan) });
}
