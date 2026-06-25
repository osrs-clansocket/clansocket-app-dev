import { FooterPanelComponent } from "../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import { FrameOverlayComponent } from "../../../dom/forms/voxlab/frame/frame-overlay-component.js";
import { OverlayComponent } from "../../../dom/forms/voxlab/panels/overlay-component.js";
import { SidebarComponent } from "../../../dom/forms/voxlab/panels/sidebar-component.js";
import { TimelinePanelComponent } from "../../../dom/forms/voxlab/panels/timeline/timeline-panel-component.js";
import { CursorService } from "../services/cursor-service.js";
import { FileService } from "../services/file-service.js";
import { PbrEncodeService } from "../services/pbr/pbr-encode-service.js";
import type { PbrShaderService } from "../services/pbr/pbr-shader-service.js";
import { HistoryService } from "../services/history-service.js";
import { PersistenceService } from "../services/persistence-service.js";
import { PresetStorageService } from "../services/preset-storage-service.js";
import { LayoutManager } from "../layout/layout-manager.js";
import type { BakerManager } from "../mesh/baker-manager.js";
import type { KeyframeRecorderService } from "../services/keyframe-recorder-service.js";
import type { LightingManager } from "../lighting/lighting-manager.js";
import type { MeshManager } from "../mesh/mesh-manager.js";
import type { SceneAugmentManager } from "../lighting/scene-augment-manager.js";
import type { SnapshotManager } from "../snapshot-manager.js";
import type { TextureBindManager } from "../mesh/texture-bind-manager.js";
import type { TexturePaintManager } from "../paint/texture-paint-manager.js";
import type { TimelineManager } from "../timeline/timeline-manager.js";
import type { ViewportManager } from "../viewport/viewport-manager.js";
import type { ScheduleState } from "./app-manager/app-manager-schedulers.js";

export abstract class AppServicesMixin extends EventTarget {
    protected readonly sidebar = new SidebarComponent();
    protected readonly footer = new FooterPanelComponent();
    protected readonly timelinePanel = new TimelinePanelComponent();
    protected readonly overlays = new OverlayComponent();
    protected readonly frameOverlay = new FrameOverlayComponent();
    protected readonly fileService = new FileService();
    protected readonly cursorService = new CursorService();
    protected readonly persistence = new PersistenceService();
    protected readonly presetStorage = new PresetStorageService();
    protected readonly history = new HistoryService();
    protected readonly pbrEncodeService = new PbrEncodeService();
    readonly layout = new LayoutManager();

    protected viewport!: ViewportManager;
    protected meshes!: MeshManager;
    augment!: SceneAugmentManager;
    lighting!: LightingManager;
    snapshot!: SnapshotManager;
    texturePaint!: TexturePaintManager;
    textureBind!: TextureBindManager;
    timeline!: TimelineManager;
    baker!: BakerManager;
    recorder!: KeyframeRecorderService;
    protected pbrShaderService: PbrShaderService | null = null;

    protected readonly persistedRestoredRef = { v: false };
    protected readonly hostManagedStateRef = { v: false };
    protected readonly lastSmoothShadingRef = { v: false };
    protected readonly schedState: ScheduleState = {
        recorderRafPending: false,
        cameraMoveRafPending: false,
        settingsSaveTimer: null,
    };

    protected abstract readonly frameAspect: number;
}
