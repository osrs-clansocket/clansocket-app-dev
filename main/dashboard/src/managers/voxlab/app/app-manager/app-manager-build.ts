import { div, scratchCanvas, type Instance } from "../../../../dom/factory/index.js";
import {
    STAGE_CANVAS_CLASS,
    STAGE_CLASS,
    TIMELINE_CENTER_COLUMN_CLASS,
    VOXLAB_TIMELINE_RESIZER_CLASS,
} from "../../../../shared/constants/voxlab/voxlab-classes-constants.js";
import type { TimelinePanelComponent } from "../../../../dom/forms/voxlab/panels/timeline/timeline-panel-component.js";

export const DEFAULT_TIMELINE_PX = 160;
const MIN_TIMELINE_PX = 80;
const MAX_TIMELINE_PCT = 0.7;
export const PUBLISH_THUMBNAIL_PX = 512;
export const SETTINGS_SAVE_DEBOUNCE_MS = 300;

function buildStageParts(): { stage: HTMLDivElement; canvas: HTMLCanvasElement; resizer: Instance<HTMLDivElement> } {
    const canvas = scratchCanvas({ width: 0, height: 0, classes: [STAGE_CANVAS_CLASS], context: null, meta: null }).el;
    const stageInst = div({ classes: [STAGE_CLASS], context: null, meta: null }, [canvas]) as Instance<HTMLDivElement>;
    const resizer = div({
        classes: [VOXLAB_TIMELINE_RESIZER_CLASS],
        role: "separator",
        ariaOrientation: "horizontal",
        context: null,
        meta: null,
    }) as Instance<HTMLDivElement>;
    return { stage: stageInst.el, canvas, resizer };
}

export function wireStageDOM(
    root: HTMLElement,
    timelinePanel: TimelinePanelComponent,
    onResizerWired: (el: HTMLElement) => void,
): { stage: HTMLDivElement; canvas: HTMLCanvasElement; centerColumn: HTMLDivElement } {
    const { stage, canvas, resizer } = buildStageParts();
    onResizerWired(resizer.el);
    const centerInst = div({ classes: [TIMELINE_CENTER_COLUMN_CLASS], context: null, meta: null }, [
        stage,
        resizer,
    ]) as Instance<HTMLDivElement>;
    const centerColumn = centerInst.el;
    timelinePanel.mount(centerColumn);
    timelinePanel.element.style.flexBasis = `${DEFAULT_TIMELINE_PX}px`;
    centerInst.mount(root);
    return { stage, canvas, centerColumn };
}

export function wireTimelineResizer(handle: HTMLElement, timelinePanel: TimelinePanelComponent): void {
    const drag = { active: false, startY: 0, startHeight: DEFAULT_TIMELINE_PX };
    handle.addEventListener("pointerdown", (e) => {
        drag.active = true;
        drag.startY = e.clientY;
        const parsed = Number.parseFloat(timelinePanel.element.style.flexBasis);
        drag.startHeight = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMELINE_PX;
        handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove", (e) => {
        if (!drag.active) return;
        const dy = drag.startY - e.clientY;
        const maxPx = window.innerHeight * MAX_TIMELINE_PCT;
        timelinePanel.element.style.flexBasis = `${Math.max(MIN_TIMELINE_PX, Math.min(maxPx, drag.startHeight + dy))}px`;
    });
    const end = (e: PointerEvent): void => {
        if (!drag.active) return;
        drag.active = false;
        handle.releasePointerCapture(e.pointerId);
    };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
}
