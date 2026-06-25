import type {
    ShadingFields,
    ShadowsFields,
    WireframeFields,
} from "../../../../dom/forms/voxlab/sections/split-sections/split-sections.js";
import type { CameraIntent } from "../../../../dom/forms/voxlab/sections/camera/camera-section-component.js";
import type { FooterPanelComponent } from "../../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type { LightingManager } from "../../lighting/lighting-manager.js";
import type { MeshManager } from "../../mesh/mesh-manager.js";
import type { ViewportManager } from "../../viewport/viewport-manager.js";

export interface SectionsCtx {
    footer: FooterPanelComponent;
    meshes: MeshManager;
    viewport: ViewportManager;
    lighting: LightingManager;
    lastSmoothShadingRef: { v: boolean };
    onReloadRequested: () => void;
    onCameraIntent: (intent: CameraIntent) => void;
}

function wireWireframeEvents(ctx: SectionsCtx): void {
    ctx.footer.wireframe.addEventListener("wireframe-change", (e) => {
        const d = (e as CustomEvent<WireframeFields>).detail;
        ctx.meshes.setWireframeColor(d.color);
        ctx.meshes.setWireframeOpacity(d.opacity);
        if (d.enabled) ctx.meshes.showWireframe();
        else ctx.meshes.hideWireframe();
    });
}

function wireShadingEvents(ctx: SectionsCtx): void {
    ctx.footer.shading.addEventListener("shading-change", (e) => {
        const d = (e as CustomEvent<ShadingFields>).detail;
        if (d.smoothShading === ctx.lastSmoothShadingRef.v) return;
        ctx.lastSmoothShadingRef.v = d.smoothShading;
        if (ctx.meshes.setShadingNormals(d.smoothShading)) ctx.viewport.markDirty();
        else ctx.meshes.setSmoothShading(d.smoothShading);
    });
    ctx.footer.shadows.addEventListener("shadows-change", (e) => {
        const enabled = (e as CustomEvent<ShadowsFields>).detail.enabled;
        ctx.viewport.setShadowsEnabled(enabled);
        ctx.lighting.setShadowsEnabled(enabled);
        ctx.meshes.setShadowsEnabled(enabled);
    });
}

export function wireSectionEvents(ctx: SectionsCtx): void {
    wireWireframeEvents(ctx);
    wireShadingEvents(ctx);
    ctx.footer.camera.addEventListener("camera-intent", (e) =>
        ctx.onCameraIntent((e as CustomEvent<CameraIntent>).detail),
    );
    ctx.footer.mesh.addEventListener("mesh-reload", () => ctx.onReloadRequested());
}

export function handleCameraIntent(
    intent: CameraIntent,
    meshes: MeshManager,
    viewport: ViewportManager,
    camera: { fitDistanceMultiplier: number; frontDistanceMultiplier: number },
): void {
    if (intent === "reset") {
        viewport.resetCamera(meshes.mesh?.geometry.boundingBox ?? null, camera.fitDistanceMultiplier);
        return;
    }
    if (intent === "front" && meshes.mesh) viewport.frontView(meshes.mesh, camera.frontDistanceMultiplier);
}
