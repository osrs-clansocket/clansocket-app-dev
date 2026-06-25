import type { Signal, ReadSignal } from "../../../factory/reactive/index.js";
import type { Instance } from "../../../factory/core";
import type { PositionsState } from "../../../../state/clans/stores/positions-store.js";
import { clampToAtlas } from "../internal/atlas-clamper.js";
import { nextAnchor } from "../internal/viewport-computer.js";
import { followedAtlasPoint } from "../internal/followed-point-extractor.js";
import { makeViewportAnimator } from "../internal/animators/viewport-animator.js";
import { WHEEL_ZOOM_PER_PIXEL } from "../../../../shared/constants/clan/clan-map-constants.js";
import type { AtlasBox } from "../../../../shared/types/view-types.js";
import { MINIMAP_H, MINIMAP_W, SCALE_X, SCALE_Y } from "./minimap-dimensions.js";

export interface InputProps {
    positions$: ReadSignal<PositionsState>;
    viewport$: Signal<AtlasBox>;
    mode$: Signal<"auto" | "manual">;
    followedHash$: ReadSignal<string | null>;
}

function viewportFromClient(
    props: InputProps,
    overlay: Instance<HTMLCanvasElement>,
    clientX: number,
    clientY: number,
): AtlasBox {
    const rect = overlay.el.getBoundingClientRect();
    const ax = (((clientX - rect.left) / rect.width) * MINIMAP_W) / SCALE_X;
    const ay = (((clientY - rect.top) / rect.height) * MINIMAP_H) / SCALE_Y;
    const cur = props.viewport$();
    return clampToAtlas({ x: ax - cur.w / 2, y: ay - cur.h / 2, w: cur.w, h: cur.h });
}

interface DragHandlers {
    onDown: (e: PointerEvent) => void;
    onMove: (e: PointerEvent) => void;
    end: (e: PointerEvent) => void;
}

function makeDragHandlers(
    props: InputProps,
    overlay: Instance<HTMLCanvasElement>,
    animator: ReturnType<typeof makeViewportAnimator>,
    draggingRef: { v: boolean },
): DragHandlers {
    const onDown = (e: PointerEvent): void => {
        if (props.followedHash$() !== null) return;
        if (e.button !== 0) return;
        draggingRef.v = true;
        overlay.el.setPointerCapture(e.pointerId);
        animator.start(viewportFromClient(props, overlay, e.clientX, e.clientY));
        props.mode$.set("manual");
    };
    const onMove = (e: PointerEvent): void => {
        if (!draggingRef.v) return;
        props.viewport$.set(viewportFromClient(props, overlay, e.clientX, e.clientY));
    };
    const end = (e: PointerEvent): void => {
        if (!draggingRef.v) return;
        draggingRef.v = false;
        if (overlay.el.hasPointerCapture(e.pointerId)) overlay.el.releasePointerCapture(e.pointerId);
    };
    return { onDown, onMove, end };
}

export function wirePointerDrag(
    props: InputProps,
    overlay: Instance<HTMLCanvasElement>,
    animator: ReturnType<typeof makeViewportAnimator>,
): void {
    const draggingRef = { v: false };
    const { onDown, onMove, end } = makeDragHandlers(props, overlay, animator, draggingRef);
    const handlers: Array<[string, EventListener]> = [
        ["pointerdown", onDown as EventListener],
        ["pointermove", onMove as EventListener],
        ["pointerup", end as EventListener],
        ["pointercancel", end as EventListener],
    ];
    for (const [type, fn] of handlers) overlay.el.addEventListener(type, fn);
    overlay.trackDispose({
        dispose: () => {
            for (const [type, fn] of handlers) overlay.el.removeEventListener(type, fn);
        },
    });
}

function applyWheelResult(
    props: InputProps,
    animator: ReturnType<typeof makeViewportAnimator>,
    clamped: AtlasBox,
    followed: boolean,
): void {
    if (followed) {
        animator.cancel();
        props.viewport$.set(clamped);
    } else {
        animator.start(clamped);
        props.mode$.set("manual");
    }
}

export function wireWheelZoom(
    props: InputProps,
    overlay: Instance<HTMLCanvasElement>,
    animator: ReturnType<typeof makeViewportAnimator>,
): void {
    const onWheel = (e: WheelEvent): void => {
        e.preventDefault();
        const rect = overlay.el.getBoundingClientRect();
        const factor = Math.exp(e.deltaY * WHEEL_ZOOM_PER_PIXEL);
        const { next, followed } = nextAnchor({
            factor,
            viewport: props.viewport$(),
            anchorAtlasX: (((e.clientX - rect.left) / rect.width) * MINIMAP_W) / SCALE_X,
            anchorAtlasY: (((e.clientY - rect.top) / rect.height) * MINIMAP_H) / SCALE_Y,
            followAtlasPoint: followedAtlasPoint(props.positions$(), props.followedHash$()),
            centerOnAnchor: true,
        });
        applyWheelResult(props, animator, clampToAtlas(next), followed);
    };
    overlay.el.addEventListener("wheel", onWheel, { passive: false });
    overlay.trackDispose({ dispose: () => overlay.el.removeEventListener("wheel", onWheel) });
}
