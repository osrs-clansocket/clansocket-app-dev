import { Raycaster, Vector2 } from "three";
import type { FooterPanelComponent } from "../../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type { MeshManager } from "../../mesh/mesh-manager.js";
import type { SceneAugmentManager } from "../../lighting/scene-augment-manager.js";
import type { ViewportManager } from "../../viewport/viewport-manager.js";

const stressRaycaster = new Raycaster();
const stressNdc = new Vector2();

export interface StressCtx {
    canvas: HTMLCanvasElement;
    footer: FooterPanelComponent;
    meshes: MeshManager;
    viewport: ViewportManager;
    augment: SceneAugmentManager;
}

export function wireStressAnchor(ctx: StressCtx): void {
    ctx.canvas.addEventListener("dblclick", (ev) => {
        if (!ctx.footer.stress.current.enabled) return;
        const mesh = ctx.meshes.mesh;
        if (!mesh) return;
        const rect = ctx.canvas.getBoundingClientRect();
        const ndcX = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
        stressNdc.set(ndcX, ndcY);
        stressRaycaster.setFromCamera(stressNdc, ctx.viewport.camera);
        const hits = stressRaycaster.intersectObject(mesh, true);
        if (hits.length > 0) ctx.augment.stress.setAnchor(hits[0].point);
        else ctx.augment.stress.setAnchor(null);
    });
}
