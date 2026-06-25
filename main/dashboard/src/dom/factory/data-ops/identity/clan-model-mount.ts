import type { Instance } from "../../core";
import { addEffectClass } from "../../effects/class-applier.js";
import type { VoxlabRenderer } from "../../../../managers/voxlab/app/voxlab-renderer.js";
import type { PublishPayload } from "../../../../managers/voxlab/app/voxlab-editor.js";
import { fetchThumbBlob } from "./thumb-blob-fetcher.js";
import { attachRenderer } from "./renderer-attacher.js";
import { attachMountPan } from "./mount-pan-attacher.js";
import { attachMountPause } from "./mount-pause-attacher.js";

const ACTIVE_MOD = "clan-model-icon--webgl-active";

const VOXLAB_RENDERERS = new WeakMap<HTMLElement, VoxlabRenderer>();

const getRenderer = (host: HTMLElement): VoxlabRenderer | undefined => VOXLAB_RENDERERS.get(host);
const setRenderer = (host: HTMLElement, r: VoxlabRenderer): void => {
    VOXLAB_RENDERERS.set(host, r);
};
const clearRenderer = (host: HTMLElement): void => {
    VOXLAB_RENDERERS.delete(host);
};

export function unmountRenderer(host: HTMLElement): void {
    const r = getRenderer(host);
    if (!r) return;
    r.unmount();
    clearRenderer(host);
}

export async function mountRenderer(host: HTMLElement, recordUrl: string, thumbnailUrl: string): Promise<boolean> {
    try {
        const [recordRes, thumbBlob, rendererModule] = await Promise.all([
            fetch(recordUrl),
            fetchThumbBlob(thumbnailUrl),
            import("../../../../managers/voxlab/app/voxlab-renderer.js"),
        ]);
        if (!recordRes.ok) return false;
        const envelope = (await recordRes.json()) as Omit<PublishPayload, "thumbnailPng"> | null;
        if (!envelope?.mesh) return false;
        if (VOXLAB_RENDERERS.has(host)) return true;
        await attachRenderer({ host, rendererModule, envelope, thumb: thumbBlob, set: setRenderer });
        return true;
    } catch {
        return false;
    }
}

export function onMountedRenderer(args: {
    host: Instance;
    fallbackImg: Instance;
    renderTarget: Instance;
    mobilePanX?: number;
}): void {
    const { host, fallbackImg, renderTarget, mobilePanX } = args;
    host.el.classList.add(ACTIVE_MOD);
    addEffectClass(fallbackImg.el, "fold-out");
    addEffectClass(renderTarget.el, "fold-in");
    const renderer = getRenderer(renderTarget.el);
    if (mobilePanX !== undefined && renderer) attachMountPan(renderTarget, renderer, mobilePanX);
    attachMountPause(renderTarget, getRenderer, clearRenderer);
}
