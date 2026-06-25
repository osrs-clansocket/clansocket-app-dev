import { AnimationsPanelComponent } from "../../../../dom/forms/voxlab/panels/animations-panel-component.js";
import type { PanelDeps } from "./panel-deps.js";

export function mountAnimationsPanel(deps: PanelDeps): AnimationsPanelComponent {
    const p = new AnimationsPanelComponent({
        getSnapshot: () => deps.snapshot.capture(),
        activeIds: () => deps.timeline.activeIds(),
        getTimelineDurationMs: () => deps.timeline.durationMs,
        getCursorMs: () => deps.timeline.currentTimeMs,
        hasTimeline: () => deps.timeline.hasTimeline(),
        applyPreset: (preset, durationMs, cursorOffsetMs) => {
            const snap = deps.snapshot.capture();
            deps.timeline.applyPresetKeyframes({
                durationMs,
                cursorOffsetMs,
                presetId: preset.id,
                snapshot: snap,
                generatedTracks: preset.generate({ durationMs, snapshot: snap }),
            });
        },
        removePreset: (presetId) => deps.timeline.removePresetKeyframes(presetId),
        addTimelineListener: (type, listener) => deps.timeline.addEventListener(type, listener),
        removeTimelineListener: (type, listener) => deps.timeline.removeEventListener(type, listener),
    });
    p.mount(deps.footer.animationsContainer);
    return p;
}
