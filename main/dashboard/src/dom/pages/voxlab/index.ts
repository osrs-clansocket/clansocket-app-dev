import "../../../styles/pages/voxlab/voxlab-page.css";
import { div, type Instance } from "../../factory";
import { voxlabSlug } from "../../../managers/router/slug-paths.js";
import { modalService } from "../../../managers/voxlab/services/modal-service.js";
import { VoxlabEditor, type InitialState } from "../../../managers/voxlab/app/voxlab-editor.js";
import { handlePublish, handleSitePublish } from "../../../managers/voxlab/services/publish-service.js";
import { siteLogoStore } from "../../../state/site/site-logo-store.js";
import { resolveFrameAspect } from "../../../shared/constants/voxlab/presets/frame-presets-constants.js";
import {
    loadSourceMesh,
    meshFromBlob,
    meshFromSource,
    type VoxlabSource,
} from "../../../voxlab/conversion/source-dispatch.js";
import type { MeshData } from "../../../voxlab/conversion/raster-to-mesh/types/types-mesh.js";

interface VoxlabPageCtx {
    slug: string;
    editor: VoxlabEditor;
    lastSource: VoxlabSource | null;
    frameAspect: number;
}

function renderVoxlab(path: string): Instance {
    const slug = voxlabSlug(path);
    const frameParam = new URLSearchParams(window.location.search).get("frame");
    if (slug.length === 0) return renderSiteVoxlab(frameParam);
    return renderClanVoxlab(slug, frameParam);
}

function renderClanVoxlab(slug: string, frameParam: string | null): Instance {
    const host = div({ classes: [], context: null, meta: null });
    const editor = new VoxlabEditor();
    const ctx: VoxlabPageCtx = {
        slug,
        editor,
        lastSource: null,
        frameAspect: resolveFrameAspect(frameParam ?? "icon"),
    };
    editor.on("publish", (payload) => handlePublish(slug, payload, editor));
    editor.on("reload", () => {
        void handleReload(ctx);
    });
    queueMicrotask(() => {
        void mountAndLoad(ctx, host.el);
    });
    return host;
}

function renderSiteVoxlab(frameParam: string | null): Instance {
    const host = div({ classes: [], context: null, meta: null });
    const editor = new VoxlabEditor();
    const frameAspect = resolveFrameAspect(frameParam ?? "hero");
    editor.on("publish", (payload) => handleSitePublish(payload, editor));
    queueMicrotask(() => {
        void mountSite(editor, host.el, frameAspect);
    });
    return host;
}

async function mountAndLoad(ctx: VoxlabPageCtx, host: HTMLElement): Promise<void> {
    const published = await tryFetchEnvelope(ctx.slug);
    if (published) {
        ctx.editor.mount(host, { initial: published, frameAspect: ctx.frameAspect });
        return;
    }
    let mesh: MeshData | null = null;
    try {
        const result = await loadSourceMesh(ctx.slug);
        mesh = result.mesh;
        ctx.lastSource = result.source;
    } catch {
        void 0;
    }
    ctx.editor.mount(host, { initial: mesh ? { mesh } : undefined, frameAspect: ctx.frameAspect });
}

async function mountSite(editor: VoxlabEditor, host: HTMLElement, frameAspect: number): Promise<void> {
    await siteLogoStore.refresh();
    const published = siteLogoStore.logo$();
    if (published) {
        editor.mount(host, { initial: published, frameAspect });
        return;
    }
    let mesh: MeshData | null = null;
    try {
        const res = await fetch("/api/site/logo");
        if (res.ok) {
            const blob = await res.blob();
            const result = await meshFromBlob(blob);
            mesh = result.mesh;
        }
    } catch {
        void 0;
    }
    editor.mount(host, { initial: mesh ? { mesh } : undefined, frameAspect });
}

async function tryFetchEnvelope(slug: string): Promise<InitialState | null> {
    try {
        const res = await fetch(`/api/clans/${encodeURIComponent(slug)}/icon-record`);
        if (!res.ok) return null;
        const env = (await res.json()) as Partial<InitialState> | null;
        if (!env?.mesh) return null;
        return { mesh: env.mesh, snapshot: env.snapshot, timeline: env.timeline };
    } catch {
        return null;
    }
}

async function handleReload(ctx: VoxlabPageCtx): Promise<void> {
    try {
        if (ctx.lastSource === null) {
            const result = await loadSourceMesh(ctx.slug);
            ctx.lastSource = result.source;
            ctx.editor.applyMesh(result.mesh);
            return;
        }
        const mesh = await meshFromSource(ctx.lastSource);
        ctx.editor.applyMesh(mesh);
    } catch {
        await modalService.alert("Could not reload mesh from source.");
    }
}

export { renderVoxlab };
