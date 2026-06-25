import type { CursorService } from "../../services/cursor-service.js";
import type { FooterPanelComponent } from "../../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import { MeshManager, installBvhPatch } from "../../mesh/mesh-manager.js";
import { SceneAugmentManager } from "../../lighting/scene-augment-manager.js";
import { BakerManager } from "../../mesh/baker-manager.js";
import { LightingManager } from "../../lighting/lighting-manager.js";
import { SnapshotManager } from "../../snapshot-manager.js";
import { TextureBindManager } from "../../mesh/texture-bind-manager.js";
import { TexturePaintManager } from "../../paint/texture-paint-manager.js";
import { TimelineManager } from "../../timeline/timeline-manager.js";
import { ViewportManager } from "../../viewport/viewport-manager.js";
import { CaptureService } from "../../services/capture-service.js";
import { KeyframeRecorderService } from "../../services/keyframe-recorder-service.js";
import { PbrShaderService } from "../../services/pbr/pbr-shader-service.js";
import { buildPaintPack, buildSceneManagers, buildTimelinePack } from "./app-manager-packs.js";

export type { DisposeDeps } from "./app-manager-dispose.js";
export { disposeAll } from "./app-manager-dispose.js";

export interface CoreManagers {
    viewport: ViewportManager;
    meshes: MeshManager;
    lighting: LightingManager;
    augment: SceneAugmentManager;
    texturePaint: TexturePaintManager;
    textureBind: TextureBindManager;
    snapshot: SnapshotManager;
    capture: CaptureService;
    timeline: TimelineManager;
    baker: BakerManager;
    recorder: KeyframeRecorderService;
    pbrShaderService: PbrShaderService;
}

export function instantiateCoreManagers(
    stage: HTMLDivElement,
    canvas: HTMLCanvasElement,
    cursorService: CursorService,
    footer: FooterPanelComponent,
): CoreManagers {
    const scene = buildSceneManagers({ stage, canvas, footer, cursorService });
    void installBvhPatch();
    const paint = buildPaintPack({ footer, canvas, meshes: scene.meshes, viewport: scene.viewport });
    const snapshot = new SnapshotManager(footer.registry);
    const capture = new CaptureService(scene.viewport);
    const timelinePack = buildTimelinePack({ footer, snapshot, capture, viewport: scene.viewport });
    const pbrShaderService = new PbrShaderService(scene.viewport.renderer);
    return { ...scene, ...paint, snapshot, capture, ...timelinePack, pbrShaderService };
}
