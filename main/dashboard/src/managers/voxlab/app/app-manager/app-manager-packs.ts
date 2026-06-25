import type { CursorService } from "../../services/cursor-service.js";
import type { FooterPanelComponent } from "../../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import { MeshManager } from "../../mesh/mesh-manager.js";
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

export function buildSceneManagers(args: {
    stage: HTMLDivElement;
    canvas: HTMLCanvasElement;
    cursorService: CursorService;
    footer: FooterPanelComponent;
}): {
    viewport: ViewportManager;
    meshes: MeshManager;
    lighting: LightingManager;
    augment: SceneAugmentManager;
} {
    const { stage, canvas, cursorService, footer } = args;
    const viewport = new ViewportManager(stage, canvas, cursorService);
    const meshes = new MeshManager(viewport.scene);
    const lighting = new LightingManager(viewport.scene, viewport.renderer);
    const augment = new SceneAugmentManager({ viewport, meshes, footer, lighting, cursor: cursorService });
    return { viewport, meshes, lighting, augment };
}

export function buildTimelinePack(args: {
    footer: FooterPanelComponent;
    viewport: ViewportManager;
    snapshot: SnapshotManager;
    capture: CaptureService;
}): { timeline: TimelineManager; baker: BakerManager; recorder: KeyframeRecorderService } {
    const timeline = new TimelineManager({ snapshot: args.snapshot, registry: args.footer.registry });
    const baker = new BakerManager({ timeline, capture: args.capture, viewport: args.viewport });
    const recorder = new KeyframeRecorderService(timeline, args.snapshot);
    return { timeline, baker, recorder };
}

export function buildPaintPack(args: {
    meshes: MeshManager;
    footer: FooterPanelComponent;
    viewport: ViewportManager;
    canvas: HTMLCanvasElement;
}): { texturePaint: TexturePaintManager; textureBind: TextureBindManager } {
    const texturePaint = new TexturePaintManager({
        meshes: args.meshes,
        footer: args.footer,
        viewport: args.viewport,
        canvas: args.canvas,
        registry: args.footer.registry,
    });
    const textureBind = new TextureBindManager({
        meshes: args.meshes,
        albedo: args.footer.albedo,
        pbrMaps: args.footer.pbrMaps,
    });
    return { texturePaint, textureBind };
}
