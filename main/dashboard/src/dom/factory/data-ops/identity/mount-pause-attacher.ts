import type { Instance } from "../../core";
import type { VoxlabRenderer } from "../../../../managers/voxlab/app/voxlab-renderer.js";

const MAX_PIXEL_RATIO = 2;

type GetRenderer = (host: HTMLElement) => VoxlabRenderer | undefined;
type ClearRenderer = (host: HTMLElement) => void;

function buildObserver(renderer: VoxlabRenderer): IntersectionObserver {
    return new IntersectionObserver(
        (entries) => {
            const entry = entries[0];
            if (!entry) return;
            if (entry.isIntersecting) {
                renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
                renderer.resume();
            } else {
                renderer.pause();
            }
        },
        { threshold: 0.01, rootMargin: "200px" },
    );
}

export function attachMountPause(host: Instance, get: GetRenderer, clear: ClearRenderer): void {
    const renderer = get(host.el);
    if (!renderer) return;
    const observer = buildObserver(renderer);
    observer.observe(host.el);
    host.trackDispose({
        dispose: () => {
            observer.disconnect();
            const r = get(host.el);
            if (!r) return;
            r.unmount();
            clear(host.el);
        },
    });
}
