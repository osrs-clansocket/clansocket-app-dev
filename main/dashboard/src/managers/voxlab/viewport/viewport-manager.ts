import { Color, type Group, PerspectiveCamera, Scene, SRGBColorSpace, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
    CAMERA_FAR,
    CAMERA_FOV,
    CAMERA_NEAR,
    CLEAR_COLOR,
    ORBIT_DAMPING_FACTOR,
} from "../../../shared/constants/voxlab/viewport-constants.js";
import { ContextRecoveryService } from "../services/context-recovery-service.js";
import type { CursorService } from "../services/cursor-service.js";
import type { MotionManager } from "../timeline/motion-manager.js";
import type { StressShaderManager } from "../effects/stress-shader-manager.js";
import { GridAxesOverlay } from "./grid-axes-overlay.js";
import { makeTick, newFpsCounter, type FpsCounter } from "./viewport-manager-tick.js";
import { performResize } from "./viewport-manager-resize.js";
import { type LifecycleHandles } from "./viewport-manager-lifecycle.js";
import { ViewportLifecycleMixin } from "./viewport-lifecycle-mixin.js";

export class ViewportManager extends ViewportLifecycleMixin {
    readonly scene = new Scene();
    camera!: PerspectiveCamera;
    readonly renderer: WebGLRenderer;
    controls!: OrbitControls;
    readonly stage: HTMLElement;
    protected readonly helpers = new GridAxesOverlay();
    protected readonly canvas: HTMLCanvasElement;
    protected readonly contextRecovery = new ContextRecoveryService();
    protected motion: MotionManager | null = null;
    protected stress: StressShaderManager | null = null;
    protected animatedGroup: Group | null = null;
    protected readonly captureHideHooks: Array<() => () => void> = [];
    protected rebuildHandler!: () => void;
    protected readonly targetFpsRef = { v: 0 };
    private readonly lastFrameMsRef = { v: 0 };
    private readonly fps: FpsCounter = newFpsCounter();
    private readonly dprRef = { v: window.devicePixelRatio || 1 };
    protected frameAspect = 1;
    protected readonly handles: LifecycleHandles = {
        rafHandle: { v: 0 },
        running: { v: false },
        needsRender: { v: true },
        resizeObserver: { v: null },
        captureTarget: { v: null },
        effects: { v: null },
    };
    protected tick!: (nowMs: number) => void;

    private setupCameraControls(canvas: HTMLCanvasElement): void {
        this.camera = new PerspectiveCamera(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR);
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = ORBIT_DAMPING_FACTOR;
        this.controls.addEventListener("change", () => {
            this.handles.needsRender.v = true;
        });
    }

    private buildTickClosure(): void {
        this.tick = makeTick({
            handles: this.handles,
            fps: this.fps,
            targetFpsRef: this.targetFpsRef,
            lastFrameMsRef: this.lastFrameMsRef,
            scene: this.scene,
            camera: this.camera,
            renderer: this.renderer,
            controls: this.controls,
            motion: () => this.motion,
            stress: () => this.stress,
            animatedGroup: () => this.animatedGroup,
            emitFps: (fps) => this.dispatchEvent(new CustomEvent<number>("fps-update", { detail: fps })),
        });
    }

    constructor(
        stage: HTMLElement,
        canvas: HTMLCanvasElement,
        protected readonly cursor: CursorService,
        injectedRenderer?: WebGLRenderer,
    ) {
        super();
        this.stage = stage;
        this.canvas = canvas;
        this.renderer = injectedRenderer ?? new WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.outputColorSpace = SRGBColorSpace;
        this.renderer.setPixelRatio(this.dprRef.v);
        this.scene.background = new Color(CLEAR_COLOR);
        this.setupCameraControls(canvas);
        this.scene.add(this.helpers.group);
        this.rebuildHandler = (): void => {
            this.dispatchEvent(new CustomEvent("rebuild-requested"));
        };
        this.contextRecovery.addEventListener("rebuild-requested", this.rebuildHandler);
        this.buildTickClosure();
    }

    protected resize = (): void => {
        if (
            performResize({
                stage: this.stage,
                renderer: this.renderer,
                camera: this.camera,
                effects: this.handles.effects.v,
                currentDprRef: this.dprRef,
                emitAspect: () => this.dispatchEvent(new CustomEvent("aspect-change")),
            })
        )
            this.handles.needsRender.v = true;
    };
}
