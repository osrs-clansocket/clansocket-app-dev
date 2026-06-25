import type { VoxlabRenderer } from "../../../../managers/voxlab/app/voxlab-renderer.js";
import type { PublishPayload } from "../../../../managers/voxlab/app/voxlab-editor.js";

type RendererModule = typeof import("../../../../managers/voxlab/app/voxlab-renderer.js");

export interface AttachRendererArgs {
    host: HTMLElement;
    rendererModule: RendererModule;
    envelope: Omit<PublishPayload, "thumbnailPng">;
    thumb: Blob;
    set: (host: HTMLElement, r: VoxlabRenderer) => void;
}

export async function attachRenderer(args: AttachRendererArgs): Promise<void> {
    const renderer = new args.rendererModule.VoxlabRenderer();
    await renderer.mount(args.host, { ...args.envelope, thumbnailPng: args.thumb }, { headless: true });
    renderer.start();
    args.set(args.host, renderer);
}
