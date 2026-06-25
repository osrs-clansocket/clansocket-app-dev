import type { BakerManager } from "../mesh/baker-manager.js";
import type { FileService } from "../services/file-service.js";
import type { FooterPanelComponent } from "../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type { KeyframeRecorderService } from "../services/keyframe-recorder-service.js";
import type { MeshManager } from "../mesh/mesh-manager.js";
import type { OverlayComponent } from "../../../dom/forms/voxlab/panels/overlay-component.js";
import type { TimelineManager } from "../timeline/timeline-manager.js";
import type { TimelinePanelComponent } from "../../../dom/forms/voxlab/panels/timeline/timeline-panel-component.js";

export interface ActionsCtx {
    baker: BakerManager;
    fileService: FileService;
    footer: FooterPanelComponent;
    meshes: MeshManager;
    overlays: OverlayComponent;
    recorder: KeyframeRecorderService;
    timeline: TimelineManager;
    timelinePanel: TimelinePanelComponent;
}

export const exportStem = (): string => "voxlab";
