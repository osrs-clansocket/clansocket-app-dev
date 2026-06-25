import type { Instance } from "../../../../../factory/index.js";
import type { BrandingController } from "../../branding-controller/index.js";
import { CANVAS_PX, clamp, TRANSLATE_MAX } from "./constants.js";
import { TWEAKER_CANVAS_DRAGGING_CLASS } from "../../../../../../shared/constants/branding-tweaker-constants.js";

type DragState = { active: boolean; pointerId: number; startX: number; startY: number; baseTX: number; baseTY: number };

function startDrag(
    e: PointerEvent,
    dragState: DragState,
    ctrl: BrandingController,
    canvasInst: Instance<HTMLCanvasElement>,
): void {
    if (e.button !== 0) return;
    dragState.active = true;
    dragState.pointerId = e.pointerId;
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;
    dragState.baseTX = ctrl.transform.translateX;
    dragState.baseTY = ctrl.transform.translateY;
    canvasInst.el.setPointerCapture(e.pointerId);
    canvasInst.toggleClass(TWEAKER_CANVAS_DRAGGING_CLASS, true);
}

interface MoveDragArgs {
    e: PointerEvent;
    dragState: DragState;
    canvasEl: HTMLCanvasElement;
    ctrl: BrandingController;
    render: () => void;
}

function moveDrag(args: MoveDragArgs): void {
    const { e, dragState, canvasEl, ctrl, render } = args;
    if (!dragState.active || e.pointerId !== dragState.pointerId) return;
    const rect = canvasEl.getBoundingClientRect();
    const scaleFactor = rect.width === 0 ? 1 : CANVAS_PX / rect.width;
    const dx = (e.clientX - dragState.startX) * scaleFactor;
    const dy = (e.clientY - dragState.startY) * scaleFactor;
    ctrl.setTransform({
        translateX: clamp(dragState.baseTX + dx, -TRANSLATE_MAX, TRANSLATE_MAX),
        translateY: clamp(dragState.baseTY + dy, -TRANSLATE_MAX, TRANSLATE_MAX),
    });
    render();
}

export function wireDragPan(
    canvasInst: Instance<HTMLCanvasElement>,
    ctrl: BrandingController,
    render: () => void,
): void {
    const canvasEl = canvasInst.el;
    const dragState: DragState = { active: false, pointerId: -1, startX: 0, startY: 0, baseTX: 0, baseTY: 0 };
    const endDrag = (e: PointerEvent): void => {
        if (!dragState.active || e.pointerId !== dragState.pointerId) return;
        canvasEl.releasePointerCapture(dragState.pointerId);
        canvasInst.toggleClass(TWEAKER_CANVAS_DRAGGING_CLASS, false);
        dragState.active = false;
    };
    const handlers: Array<[string, (e: PointerEvent) => void]> = [
        ["pointerdown", (e) => startDrag(e, dragState, ctrl, canvasInst)],
        ["pointermove", (e) => moveDrag({ e, dragState, canvasEl, ctrl, render })],
        ["pointerup", endDrag],
        ["pointercancel", endDrag],
    ];
    for (const [type, fn] of handlers) canvasEl.addEventListener(type, fn as EventListener);
}
