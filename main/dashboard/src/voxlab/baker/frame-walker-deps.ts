import type { CaptureService } from "../../managers/voxlab/services/capture-service.js";
import type { TimelineManager } from "../../managers/voxlab/timeline/timeline-manager.js";
import type { ViewportManager } from "../../managers/voxlab/viewport/viewport-manager.js";

export interface FrameWalkerDeps {
    viewport: ViewportManager;
    capture: CaptureService;
    timeline: TimelineManager;
}
