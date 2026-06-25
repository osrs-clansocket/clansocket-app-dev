import type { Instance } from "../../../../factory/index.js";
import { attachPointerHandlers, releasePointerCapture, tryPointerCapture } from "./timeline-component-pointer.js";
import {
    DRAG_THRESHOLD_PX,
    MIN_DRAG_COMMIT_DELTA_MS,
    MS_PER_SECOND,
    PERCENT_SCALE,
    type MarkerDragContext,
    type TimelineSource,
} from "./timeline-component-types.js";

function onMarkerMove(ctx: MarkerDragContext, moveEvent: PointerEvent): void {
    const { marker, dragState, originalTime, durationMs, railRect, frameMs } = ctx;
    const deltaPx = moveEvent.clientX - dragState.startX;
    if (!dragState.dragged && Math.abs(deltaPx) >= DRAG_THRESHOLD_PX) dragState.dragged = true;
    const deltaT = (deltaPx / railRect.width) * durationMs;
    const raw = originalTime + deltaT;
    const snapped = moveEvent.altKey ? raw : Math.round(raw / frameMs) * frameMs;
    const next = Math.max(0, Math.min(durationMs, snapped));
    dragState.currentTime = next;
    marker.setAttr("style", `inset-inline-start: ${(next / durationMs) * PERCENT_SCALE}%`);
    marker.setAttr("title", `${(next / MS_PER_SECOND).toFixed(2)}s · frame ${Math.round(next / frameMs)}`);
}

function commitOrSeek(
    source: TimelineSource | null,
    dragState: { currentTime: number; dragged: boolean },
    originalTime: number,
): void {
    if (!source) return;
    if (dragState.dragged && Math.abs(dragState.currentTime - originalTime) >= MIN_DRAG_COMMIT_DELTA_MS) {
        source.moveKeyframes(originalTime, dragState.currentTime);
    } else {
        source.seek(originalTime);
    }
}

function makeDragCleanup(
    marker: Instance<HTMLButtonElement>,
    downEvent: PointerEvent,
    detach: { fn: () => void },
): () => void {
    return (): void => {
        detach.fn();
        marker.removeAttr("data-dragging");
        releasePointerCapture(marker.el, downEvent.pointerId);
    };
}

function buildDragHandlers(
    ctx: MarkerDragContext,
    source: TimelineSource | null,
    detach: { fn: () => void },
): { onMove: (e: PointerEvent) => void; onUp: () => void; onCancel: () => void } {
    const { marker, dragState, downEvent, originalTime, durationMs } = ctx;
    const cleanup = makeDragCleanup(marker, downEvent, detach);
    return {
        onMove: (moveEvent: PointerEvent) => onMarkerMove(ctx, moveEvent),
        onUp: () => {
            cleanup();
            commitOrSeek(source, dragState, originalTime);
        },
        onCancel: () => {
            cleanup();
            marker.setAttr("style", `inset-inline-start: ${(originalTime / durationMs) * PERCENT_SCALE}%`);
        },
    };
}

export function wireMarkerDrag(ctx: MarkerDragContext, source: TimelineSource | null): void {
    const detach: { fn: () => void } = { fn: () => undefined };
    const { onMove, onUp, onCancel } = buildDragHandlers(ctx, source, detach);
    detach.fn = attachPointerHandlers(ctx.marker.el, onMove, onUp, onCancel);
}

export interface MarkerDownArgs {
    marker: Instance<HTMLButtonElement>;
    source: TimelineSource | null;
    markerRailEl: HTMLElement;
    downEvent: PointerEvent;
    originalTime: number;
    durationMs: number;
}

export function onMarkerDown(args: MarkerDownArgs): void {
    const { marker, source, markerRailEl, downEvent, originalTime, durationMs } = args;
    if (downEvent.button !== 0 || !source) return;
    downEvent.preventDefault();
    downEvent.stopPropagation();
    const railRect = markerRailEl.getBoundingClientRect();
    if (railRect.width <= 0 || durationMs <= 0) return;
    const frameMs = MS_PER_SECOND / Math.max(1, source.fps);
    const dragState = { startX: downEvent.clientX, currentTime: originalTime, dragged: false };
    marker.setAttr("data-dragging", "true");
    tryPointerCapture(marker.el, downEvent.pointerId);
    wireMarkerDrag({ marker, dragState, downEvent, originalTime, durationMs, railRect, frameMs }, source);
}
