import { DEFAULT_FRAME_ASPECT } from "../../../shared/constants/voxlab/presets/frame-presets-constants.js";
import type { PublishPayload, InitialState } from "./voxlab-editor.js";
import { VOXLAB_PAGE_CLASS } from "../../../shared/constants/voxlab/voxlab-classes-constants.js";
import { wireStageDOM, wireTimelineResizer } from "./app-manager/app-manager-build.js";
import {
    performClearAll,
    performRedoAll,
    performResetPath,
    performUndoAll,
} from "./app-manager/app-manager-history.js";
import { buildPublishPayload } from "./app-manager/app-manager-publish.js";
import { mountAllPanels } from "./app-manager/app-manager-panels.js";
import { disposeAll, instantiateCoreManagers } from "./app-manager/app-manager-bootstrap.js";
import { runPublishGuarded } from "./app-manager/app-manager-runners.js";
import { scheduleSettingsSave, wireRecorderListeners } from "./app-manager/app-manager-schedulers.js";
import { buildStubTimeline, wireTimelineLifecycle } from "./app-manager/app-manager-init.js";
import {
    applyInitial as applyInitialFn,
    applyPresetSnapshot as applyPresetSnapshotFn,
    startViewport,
} from "./app-manager/app-manager-lifecycle.js";
import { setupVoxlabApp } from "./app-manager/app-manager-setup.js";
import { AppContextsMixin } from "./app-contexts-mixin.js";

export interface AppManagerConfig {
    onPublish?: (payload: PublishPayload) => Promise<void> | void;
    onReloadRequested?: () => void;
    frameAspect?: number;
}

export class VoxlabAppManager extends AppContextsMixin {
    private stage!: HTMLDivElement;
    private centerColumn!: HTMLDivElement;
    private canvas!: HTMLCanvasElement;
    protected readonly frameAspect: number;
    private readonly config: AppManagerConfig;

    private invokeSetup(): void {
        setupVoxlabApp({
            footer: this.footer,
            sidebar: this.sidebar,
            overlays: this.overlays,
            timelinePanel: this.timelinePanel,
            augment: this.augment,
            lighting: this.lighting,
            meshes: this.meshes,
            viewport: this.viewport,
            texturePaint: this.texturePaint,
            canvas: this.canvas,
            layout: this.layout,
            lastSmoothShadingRef: this.lastSmoothShadingRef,
            onReloadRequested: () => this.config.onReloadRequested?.(),
            actionsCtx: () => this.actionsCtx,
            pbrCtx: () => this.pbrCtx,
            runPublish: () => this.runPublish(),
        });
    }

    constructor(root: HTMLElement, config: AppManagerConfig = {}) {
        super();
        this.config = config;
        this.frameAspect = config.frameAspect ?? DEFAULT_FRAME_ASPECT;
        root.classList.add(VOXLAB_PAGE_CLASS);
        this.footer.mount(root);
        const stage = wireStageDOM(root, this.timelinePanel, (el) => wireTimelineResizer(el, this.timelinePanel));
        this.stage = stage.stage;
        this.canvas = stage.canvas;
        this.centerColumn = stage.centerColumn;
        this.overlays.mount(this.stage);
        this.frameOverlay.mount(this.stage);
        this.frameOverlay.setFrameAspect(this.frameAspect);
        this.sidebar.mount(root);
        Object.assign(this, instantiateCoreManagers(this.stage, this.canvas, this.cursorService, this.footer));
        this.viewport.setFrameAspect(this.frameAspect);
        wireTimelineLifecycle(this.timelinePanel, this.timeline, this.recorder, this.centerColumn);
        wireRecorderListeners(this.schedDeps, this.footer, this.texturePaint, this.viewport);
        this.timeline.load(buildStubTimeline(this.snapshot));
        this.mountPanels();
        this.history.initialize(this.snapshot.capture());
        this.invokeSetup();
    }

    private mountPanels(): void {
        mountAllPanels({
            footer: this.footer,
            snapshot: this.snapshot,
            timeline: this.timeline,
            lighting: this.lighting,
            presetStorage: this.presetStorage,
            history: this.history,
            sidebar: this.sidebar,
            onPresetApply: (s) => applyPresetSnapshotFn(this.lifecycleDeps, s),
            onHdrChanged: () => scheduleSettingsSave(this.schedDeps),
            onUndo: () => performUndoAll(this.histCtx),
            onRedo: () => performRedoAll(this.histCtx),
            onResetPath: (path) => performResetPath(this.histCtx, path),
            onClearAll: () => performClearAll(this.histCtx),
        });
    }

    start(): void {
        startViewport(this.lifecycleDeps);
    }
    applyInitial(initial: InitialState): void {
        applyInitialFn(this.lifecycleDeps, initial);
    }
    async publish(): Promise<PublishPayload> {
        return buildPublishPayload(this.publishCtx);
    }
    private async runPublish(): Promise<void> {
        await runPublishGuarded(this.sidebar, this.overlays, () => this.publish(), this.config.onPublish);
    }

    private disposed = false;

    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        const pbrRef = { v: this.pbrShaderService as { dispose: () => void } | null };
        const timerRef = { v: this.schedState.settingsSaveTimer };
        disposeAll({
            settingsSaveTimer: timerRef,
            texturePaint: this.texturePaint,
            textureBind: this.textureBind,
            pbrShaderServiceRef: pbrRef,
            pbrEncodeService: this.pbrEncodeService,
            lighting: this.lighting,
            meshes: this.meshes,
            augment: this.augment,
            footer: this.footer,
            sidebar: this.sidebar,
            timelinePanel: this.timelinePanel,
            overlays: this.overlays,
            frameOverlay: this.frameOverlay,
            viewport: this.viewport,
        });
        this.schedState.settingsSaveTimer = timerRef.v;
        this.pbrShaderService = null;
    }
}
