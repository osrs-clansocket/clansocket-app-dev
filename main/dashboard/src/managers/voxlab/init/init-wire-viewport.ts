import type { FooterPanelComponent } from "../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type { MeshManager } from "../mesh/mesh-manager.js";
import type { ViewportManager } from "../viewport/viewport-manager.js";

export function wireViewportEvents(viewport: ViewportManager, meshes: MeshManager, footer: FooterPanelComponent): void {
    viewport.addEventListener("rebuild-requested", () => meshes.rebuild(footer.wireframe.current.enabled));
    viewport.addEventListener("fps-update", (e) =>
        footer.targetFps.updateRealtimeFps((e as CustomEvent<number>).detail),
    );
    viewport.addEventListener("aspect-change", () => {
        const box = meshes.mesh?.geometry.boundingBox ?? null;
        if (box) viewport.resetCamera(box, footer.camera.current.fitDistanceMultiplier);
    });
}
