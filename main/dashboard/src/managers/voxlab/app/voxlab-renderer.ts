import { div, scratchCanvas, type Instance } from "../../../dom/factory/index.js";
import { FooterPanelComponent } from "../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import { CLS_CANVAS, CLS_STAGE, STYLE_CANVAS, STYLE_STAGE, ensureVoxlabCss } from "./voxlab-renderer-styles.js";
import type { LightingManager } from "../lighting/lighting-manager.js";
import type { MeshManager } from "../mesh/mesh-manager.js";
import type { SceneAugmentManager } from "../lighting/scene-augment-manager.js";
import type { SnapshotManager } from "../snapshot-manager.js";
import type { TextureBindManager } from "../mesh/texture-bind-manager.js";
import type { TimelineManager } from "../timeline/timeline-manager.js";
import type { ViewportManager } from "../viewport/viewport-manager.js";
import { CursorService } from "../services/cursor-service.js";
import { pickRenderer } from "../services/renderer/renderer-factory.js";
import type { PublishPayload } from "./voxlab-editor.js";
import { applyPayloadTo, buildRendererKit } from "./voxlab-renderer-build.js";

export class VoxlabRenderer extends EventTarget {
    private viewport: ViewportManager | null = null;
    private meshes: MeshManager | null = null;
    private lighting: LightingManager | null = null;
    private augment: SceneAugmentManager | null = null;
    private snapshotMgr: SnapshotManager | null = null;
    private timeline: TimelineManager | null = null;
    private textureBind: TextureBindManager | null = null;
    private footer: FooterPanelComponent | null = null;
    private stageInst: Instance | null = null;
    private stage: HTMLDivElement | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private host: HTMLElement | null = null;
    private horizontalPan = 0;

    private mountStage(host: HTMLElement): void {
        const canvasInst = scratchCanvas({ width: 0, height: 0, classes: [CLS_CANVAS], context: null, meta: null });
        canvasInst.setAttr("style", STYLE_CANVAS);
        this.canvas = canvasInst.el;
        this.stageInst = div({ classes: [CLS_STAGE], style: STYLE_STAGE, context: null, meta: null }, [this.canvas]);
        this.stage = this.stageInst.el as HTMLDivElement;
        this.stageInst.mount(host);
    }

    private async installKit(headless: boolean): Promise<void> {
        this.footer = new FooterPanelComponent({ headless });
        this.footer.buildAllSections();
        const renderer = await pickRenderer({
            canvas: this.canvas!,
            antialias: true,
            alpha: true,
            preferWebGpu: false,
        });
        Object.assign(
            this,
            buildRendererKit({
                stage: this.stage!,
                canvas: this.canvas!,
                footer: this.footer,
                cursor: new CursorService(),
                injectedRenderer: renderer,
            }),
        );
    }

    async mount(host: HTMLElement, payload?: PublishPayload, opts?: { headless?: boolean }): Promise<void> {
        if (this.viewport)
            throw new Error(`VoxlabRenderer.mount: already mounted — call unmount() first (hostTag=${host.tagName})`);
        const headless = opts?.headless === true;
        if (!headless) void ensureVoxlabCss();
        this.host = host;
        this.mountStage(host);
        await this.installKit(headless);
        if (payload) {
            if (payload.sourceAlbedoImage) await this.textureBind!.setSourceImage(payload.sourceAlbedoImage);
            this.setPayload(payload);
        }
    }

    setPayload(payload: PublishPayload): void {
        if (!this.meshes || !this.snapshotMgr || !this.timeline || !this.viewport)
            throw new Error("VoxlabRenderer.setPayload: not mounted");
        applyPayloadTo(
            {
                meshes: this.meshes,
                snapshotMgr: this.snapshotMgr,
                timeline: this.timeline,
                viewport: this.viewport,
                footer: this.footer,
            },
            payload,
        );
    }

    start(): void {
        this.viewport?.start();
        if (this.footer && this.viewport) this.applyHorizontalPan();
        this.timeline?.play();
    }

    setHorizontalPan(panX: number): void {
        this.horizontalPan = panX;
        this.applyHorizontalPan();
    }

    private applyHorizontalPan(): void {
        if (!this.viewport || !this.footer) return;
        this.viewport.applyCameraExact(this.footer.camera.current);
        if (this.horizontalPan !== 0) this.viewport.panCamera(this.horizontalPan);
    }

    stop(): void {
        this.viewport?.stop();
    }
    pause(): void {
        this.viewport?.pauseTick();
    }
    setPixelRatio(ratio: number): void {
        this.viewport?.setPixelRatio(ratio);
    }
    resume(): void {
        this.viewport?.resumeTick();
    }

    unmount(): void {
        if (this.viewport === null) return;
        this.viewport.stop();
        if (this.stageInst && this.host && this.stage?.parentElement === this.host) this.stageInst.detach();
        this.textureBind?.dispose();
        this.augment?.dispose();
        this.lighting?.dispose();
        this.meshes?.dispose();
        this.viewport = null;
        this.meshes = null;
        this.lighting = null;
        this.augment = null;
        this.snapshotMgr = null;
        this.timeline = null;
        this.textureBind = null;
        this.footer = null;
        this.stage = null;
        this.stageInst = null;
        this.canvas = null;
        this.host = null;
    }

    get isMounted(): boolean {
        return this.viewport !== null;
    }
}
