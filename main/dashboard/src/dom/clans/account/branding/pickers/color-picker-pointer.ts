import { wireClick, type Instance } from "../../../../factory/index.js";
import { ACCOUNT_BRANDING_SWATCHES_DRAGGING_CLASS } from "../../../../../shared/constants/account-constants.js";

const DRAG_THRESHOLD_PX = 3;

interface DragState {
    startX: number;
    startScroll: number;
    pointerId: number;
    moved: boolean;
}

function suppressNextClick(swatchGrid: Instance): void {
    wireClick(swatchGrid.el, {
        handler: (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
        },
        capture: true,
        once: true,
        raw: true,
    });
}

function dragPointerMove(swatchGrid: Instance, dragState: DragState, e: PointerEvent): void {
    const dx = e.clientX - dragState.startX;
    if (Math.abs(dx) <= DRAG_THRESHOLD_PX) return;
    if (!dragState.moved) {
        swatchGrid.el.setPointerCapture(dragState.pointerId);
        swatchGrid.toggleClass(ACCOUNT_BRANDING_SWATCHES_DRAGGING_CLASS, true);
    }
    dragState.moved = true;
    swatchGrid.el.scrollLeft = dragState.startScroll - dx;
}

function makeEndDrag(
    swatchGrid: Instance,
    getState: () => DragState | null,
    clearState: () => void,
): (e: PointerEvent) => void {
    return (e) => {
        const state = getState();
        if (!state || e.pointerId !== state.pointerId) return;
        if (state.moved) {
            swatchGrid.el.releasePointerCapture(state.pointerId);
            swatchGrid.toggleClass(ACCOUNT_BRANDING_SWATCHES_DRAGGING_CLASS, false);
            suppressNextClick(swatchGrid);
        }
        clearState();
    };
}

function dragDown(swatchGrid: Instance, setState: (s: DragState | null) => void): (e: PointerEvent) => void {
    return (e) => {
        if (e.button !== 0) return;
        setState({ startX: e.clientX, startScroll: swatchGrid.el.scrollLeft, pointerId: e.pointerId, moved: false });
    };
}

function dragMove(swatchGrid: Instance, getState: () => DragState | null): (e: PointerEvent) => void {
    return (e) => {
        const state = getState();
        if (!state || e.pointerId !== state.pointerId) return;
        dragPointerMove(swatchGrid, state, e);
    };
}

function makeDragHandlers(
    swatchGrid: Instance,
    getState: () => DragState | null,
    setState: (s: DragState | null) => void,
): Array<[string, (e: PointerEvent) => void]> {
    const endDrag = makeEndDrag(swatchGrid, getState, () => setState(null));
    return [
        ["pointerdown", dragDown(swatchGrid, setState)],
        ["pointermove", dragMove(swatchGrid, getState)],
        ["pointerup", endDrag],
        ["pointercancel", endDrag],
    ];
}

export function wirePointerDrag(swatchGrid: Instance): void {
    let dragState: DragState | null = null;
    const handlers = makeDragHandlers(
        swatchGrid,
        () => dragState,
        (s) => {
            dragState = s;
        },
    );
    for (const [type, fn] of handlers) swatchGrid.el.addEventListener(type, fn as EventListener);
}
