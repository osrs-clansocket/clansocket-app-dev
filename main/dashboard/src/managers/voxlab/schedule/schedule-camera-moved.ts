import type { FooterPanelComponent } from "../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type { KeyframeRecorderService } from "../services/keyframe-recorder-service.js";
import type { SnapshotManager } from "../snapshot-manager.js";
import type { TimelineManager } from "../timeline/timeline-manager.js";
import type { ViewportManager } from "../viewport/viewport-manager.js";

export interface CameraMovedArgs {
    snapshot: SnapshotManager;
    viewport: ViewportManager;
    footer: FooterPanelComponent;
    timeline: TimelineManager;
    recorder: KeyframeRecorderService;
    save: () => void;
}

export function onCameraMoved(args: CameraMovedArgs): void {
    const { snapshot, viewport, footer, timeline, recorder, save } = args;
    if (snapshot.isRestoring) return;
    const camera = viewport.camera;
    const target = viewport.controls.target;
    const existing = footer.camera.current;
    footer.camera.syncFrom({
        ...existing,
        fov: camera.fov,
        near: camera.near,
        far: camera.far,
        positionX: camera.position.x,
        positionY: camera.position.y,
        positionZ: camera.position.z,
        targetX: target.x,
        targetY: target.y,
        targetZ: target.z,
    });
    if (timeline.hasTimeline()) recorder.recordChange();
    save();
}
