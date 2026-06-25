import type { Disposable } from "../../../../factory/reactive/index.js";
import { viewportToComposite } from "../../paint/calculators/viewport-calculator.js";
import type { MapStateSignals } from "../state.js";
import { clampToAtlas } from "../atlas-clamper.js";

interface PanState {
    dragging: boolean;
    lastX: number;
    lastY: number;
}

const POINTER_EVENTS = ["pointerdown", "pointermove", "pointerup", "pointercancel"] as const;

function applyPanMove(state: MapStateSignals, dxCanvas: number, dyCanvas: number): void {
    const viewport = state.viewport$();
    const dims = state.canvasDims$();
    const view = viewportToComposite(viewport, dims.w, dims.h);
    state.viewport$.set(
        clampToAtlas({
            x: viewport.x - dxCanvas / view.scale,
            y: viewport.y - dyCanvas / view.scale,
            w: viewport.w,
            h: viewport.h,
        }),
    );
}

function handlePanDown(s: PanState, state: MapStateSignals, canvasEl: HTMLElement, e: PointerEvent): void {
    if (e.button !== 0) return;
    s.dragging = true;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    canvasEl.setPointerCapture(e.pointerId);
    state.mode$.set("manual");
}

function handlePanMove(s: PanState, state: MapStateSignals, e: PointerEvent): void {
    if (!s.dragging) return;
    if (state.followedHash$() !== null) return;
    const dpr = window.devicePixelRatio || 1;
    const dxCanvas = (e.clientX - s.lastX) * dpr;
    const dyCanvas = (e.clientY - s.lastY) * dpr;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    applyPanMove(state, dxCanvas, dyCanvas);
}

function handlePanUp(s: PanState, canvasEl: HTMLElement, e: PointerEvent): void {
    if (!s.dragging) return;
    s.dragging = false;
    if (canvasEl.hasPointerCapture(e.pointerId)) canvasEl.releasePointerCapture(e.pointerId);
}

export function bindPan(canvasEl: HTMLElement, state: MapStateSignals): Disposable {
    const s: PanState = { dragging: false, lastX: 0, lastY: 0 };
    const handlers: Record<string, (e: PointerEvent) => void> = {
        pointerdown: (e) => handlePanDown(s, state, canvasEl, e),
        pointermove: (e) => handlePanMove(s, state, e),
        pointerup: (e) => handlePanUp(s, canvasEl, e),
        pointercancel: (e) => handlePanUp(s, canvasEl, e),
    };
    for (const ev of POINTER_EVENTS) canvasEl.addEventListener(ev, handlers[ev] as EventListener);
    return {
        dispose: () => {
            for (const ev of POINTER_EVENTS) canvasEl.removeEventListener(ev, handlers[ev] as EventListener);
        },
    };
}
