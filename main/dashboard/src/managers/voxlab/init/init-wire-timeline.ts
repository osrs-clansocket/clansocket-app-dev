import type { KeyframeRecorderService } from "../services/keyframe-recorder-service.js";
import type { TimelineManager } from "../timeline/timeline-manager.js";
import type { TimelinePanelComponent } from "../../../dom/forms/voxlab/panels/timeline/timeline-panel-component.js";

export function wireTimelineLifecycle(
    timelinePanel: TimelinePanelComponent,
    timeline: TimelineManager,
    recorder: KeyframeRecorderService,
    centerColumn: HTMLDivElement,
): void {
    timelinePanel.bind(timeline);
    timeline.addEventListener("timeline-loaded", () => {
        centerColumn.dataset.timelineActive = "true";
    });
    timeline.addEventListener("timeline-unloaded", () => {
        delete centerColumn.dataset.timelineActive;
    });
    timeline.addEventListener("timeline-seek", () => recorder.refreshBaseline());
}
