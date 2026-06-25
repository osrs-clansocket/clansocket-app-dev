import type { FooterPanelComponent } from "../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import { LightingManager } from "../lighting/lighting-manager.js";
import { MeshManager } from "../mesh/mesh-manager.js";
import { SceneAugmentManager } from "../lighting/scene-augment-manager.js";
import { SnapshotManager } from "../snapshot-manager.js";
import { TextureBindManager } from "../mesh/texture-bind-manager.js";
import { TimelineManager } from "../timeline/timeline-manager.js";
import { ViewportManager } from "../viewport/viewport-manager.js";
import type { CursorService } from "../services/cursor-service.js";
import type { PublishPayload } from "./voxlab-editor.js";

export interface RendererKit {
    viewport: ViewportManager;
    meshes: MeshManager;
    lighting: LightingManager;
    augment: SceneAugmentManager;
    snapshotMgr: SnapshotManager;
    timeline: TimelineManager;
    textureBind: TextureBindManager;
}

export interface BuildArgs {
    stage: HTMLDivElement;
    canvas: HTMLCanvasElement;
    footer: FooterPanelComponent;
    cursor: CursorService;
    injectedRenderer?: import("three").WebGLRenderer;
}

export function buildRendererKit(args: BuildArgs): RendererKit {
    const viewport = new ViewportManager(args.stage, args.canvas, args.cursor, args.injectedRenderer);
    viewport.scene.background = null;
    viewport.renderer.setClearAlpha(0);
    const meshes = new MeshManager(viewport.scene);
    const textureBind = new TextureBindManager({
        meshes,
        albedo: args.footer.albedo,
        pbrMaps: args.footer.pbrMaps,
    });
    const lighting = new LightingManager(viewport.scene, viewport.renderer);
    const augment = new SceneAugmentManager({
        viewport,
        meshes,
        lighting,
        cursor: args.cursor,
        footer: args.footer,
    });
    const snapshotMgr = new SnapshotManager(args.footer.registry);
    const timeline = new TimelineManager({ snapshot: snapshotMgr, registry: args.footer.registry });
    return { viewport, meshes, lighting, augment, snapshotMgr, timeline, textureBind };
}

export interface PayloadDeps {
    meshes: MeshManager;
    snapshotMgr: SnapshotManager;
    timeline: TimelineManager;
    viewport: ViewportManager;
    footer: FooterPanelComponent | null;
}

export function applyPayloadTo(deps: PayloadDeps, payload: PublishPayload): void {
    const shadingPart = payload.snapshot?.parts?.shading as { smoothShading?: boolean } | undefined;
    if (shadingPart?.smoothShading !== undefined) deps.meshes.setSmoothShading(shadingPart.smoothShading);
    deps.meshes.loadMesh(payload.mesh, false);
    deps.snapshotMgr.restore(payload.snapshot);
    deps.timeline.load(payload.timeline);
    const snapshotCamera = payload.snapshot?.parts?.camera;
    if (snapshotCamera && deps.footer) {
        const cameraSection = deps.footer.camera;
        cameraSection.apply(snapshotCamera as Parameters<typeof cameraSection.apply>[0]);
    }
    deps.viewport.setAidsVisible(false);
    deps.viewport.scene.background = null;
    deps.viewport.renderer.setClearAlpha(0);
    deps.timeline.setLoop(true);
}
