import { div, type Instance } from "../../../../factory/index.js";
import { modalService } from "../../../../../managers/voxlab/services/modal-service.js";
import { TIMELINE_PANEL_KEYFRAME_ACTIONS_CLASS } from "../../../../../shared/constants/voxlab/voxlab-classes-constants.js";
import { buildActionBtn, buildClearBtn, buildTrackingBtn } from "./timeline-component-build.js";
import type { TimelineSource } from "./timeline-component-types.js";

export interface KeyframeActionsDeps {
    getSource: () => TimelineSource | null;
    onToggleTracking: (active: boolean) => void;
    trackingActive: () => boolean;
}

function buildClearAction(deps: KeyframeActionsDeps): Instance {
    return buildClearBtn(async () => {
        if (
            await modalService.confirm("Wipe every keyframe from every track?", { danger: true, confirmLabel: "Clear" })
        )
            deps.getSource()?.clearAllKeyframes();
    });
}

export function buildKeyframeActions(deps: KeyframeActionsDeps): {
    el: HTMLElement;
    tracking: Instance<HTMLButtonElement>;
} {
    const tracking = buildTrackingBtn(() => deps.onToggleTracking(!deps.trackingActive()));
    const addBtn = buildActionBtn("+ Key", "Snap all current values as keyframes at the cursor", () =>
        deps.getSource()?.snapAtCursor(),
    );
    const delBtn = buildActionBtn("− Key", "Delete keyframes within half a frame of the cursor", () =>
        deps.getSource()?.deleteNearCursor(),
    );
    const clearBtn = buildClearAction(deps);
    const root = div({ classes: [TIMELINE_PANEL_KEYFRAME_ACTIONS_CLASS], context: null, meta: null }, [
        tracking.el,
        addBtn.el,
        delBtn.el,
        clearBtn.el,
    ]);
    return { el: root.el, tracking };
}
