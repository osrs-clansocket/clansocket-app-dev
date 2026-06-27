import { div, effect, type Instance, baseProps } from "../../../factory";
import { wirePointerDrag } from "../../../factory/events/pointer-wirer.js";
import { reconcile } from "../../../factory/live-ops/reconcile.js";
import { setDynProps } from "../../../../state/dynamic-styles.js";
import type { EditorState } from "./homepage-editor-state.js";
import type { Guide } from "./homepage-guides-state.js";

const LAYER_CLASS = "clans-home__guides-layer";
const GUIDE_CLASS = "clans-home__guide";
const GUIDE_X_CLASS = "clans-home__guide--x";
const GUIDE_Y_CLASS = "clans-home__guide--y";
const REMOVE_HOVER_CLASS = "is-remove";
const CANVAS_W = 960;

interface GuideDragCtx {
    readonly host: Instance;
    readonly canvas: HTMLElement;
    readonly axis: "x" | "y";
    readonly state: EditorState;
    readonly id: string;
    scale: number;
    base: number;
    downClient: number;
    dragging: boolean;
}

function pointerInsideCanvas(canvas: HTMLElement, e: PointerEvent): boolean {
    const r = canvas.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
}

function patchGuide(host: Instance, g: Guide): void {
    setDynProps(host.el, { "--guide-pos": String(g.position) });
}

function onGuideDown(ctx: GuideDragCtx, baseGuide: Guide, e: PointerEvent): void {
    const rect = ctx.canvas.getBoundingClientRect();
    ctx.scale = rect.width > 0 ? CANVAS_W / rect.width : 1;
    ctx.base = baseGuide.position;
    ctx.downClient = ctx.axis === "x" ? e.clientX : e.clientY;
    ctx.dragging = true;
    ctx.host.el.setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
}

function onGuideMove(ctx: GuideDragCtx, e: PointerEvent): void {
    if (!ctx.dragging) return;
    const delta = (ctx.axis === "x" ? e.clientX : e.clientY) - ctx.downClient;
    ctx.state.moveGuide(ctx.id, ctx.base + delta * ctx.scale);
    ctx.host.toggleClass(REMOVE_HOVER_CLASS, !pointerInsideCanvas(ctx.canvas, e));
}

function onGuideUp(ctx: GuideDragCtx, e: PointerEvent): void {
    if (!ctx.dragging) return;
    ctx.dragging = false;
    if (ctx.host.el.hasPointerCapture(e.pointerId)) ctx.host.el.releasePointerCapture(e.pointerId);
    if (!pointerInsideCanvas(ctx.canvas, e)) ctx.state.removeGuide(ctx.id);
    ctx.host.toggleClass(REMOVE_HOVER_CLASS, false);
}

function onGuideCancel(ctx: GuideDragCtx, e: PointerEvent): void {
    if (!ctx.dragging) return;
    ctx.dragging = false;
    if (ctx.host.el.hasPointerCapture(e.pointerId)) ctx.host.el.releasePointerCapture(e.pointerId);
    ctx.host.toggleClass(REMOVE_HOVER_CLASS, false);
}

function attachGuideDrag(host: Instance, g: Guide, canvas: HTMLElement, state: EditorState): void {
    const ctx: GuideDragCtx = {
        axis: g.axis,
        id: g.id,
        scale: 1,
        base: g.position,
        downClient: 0,
        dragging: false,
        host,
        canvas,
        state,
    };
    const dispose = wirePointerDrag(host.el, {
        down: (e) => onGuideDown(ctx, g, e),
        move: (e) => onGuideMove(ctx, e),
        up: (e) => onGuideUp(ctx, e),
        cancel: (e) => onGuideCancel(ctx, e),
    });
    host.trackDispose({ dispose });
}

function makeGuideCreator(canvas: HTMLElement, state: EditorState): (g: Guide) => Instance {
    return (g) => {
        const variantClass = g.axis === "x" ? GUIDE_X_CLASS : GUIDE_Y_CLASS;
        const host = div(baseProps([GUIDE_CLASS, variantClass]));
        patchGuide(host, g);
        attachGuideDrag(host, g, canvas, state);
        return host;
    };
}

export function buildGuidesLayer(canvas: Instance, state: EditorState): Instance {
    const layer = div(baseProps([LAYER_CLASS]));
    const hosts = new Map<string, Instance>();
    const create = makeGuideCreator(canvas.el, state);
    layer.trackDispose(
        effect(() => {
            const items = state.guidesEnabled$() ? state.guides$() : [];
            reconcile<Guide>({
                items,
                create,
                patch: patchGuide,
                container: layer,
                state: hosts,
                keyOf: (g) => g.id,
            });
        }),
    );
    return layer;
}
