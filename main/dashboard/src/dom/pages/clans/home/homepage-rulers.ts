import { div, effect, type Instance, baseProps } from "../../../factory";
import { wirePointerDrag } from "../../../factory/events/pointer-wirer.js";
import type { EditorState } from "./homepage-editor-state.js";
import type { GuideAxis } from "./homepage-guides-state.js";
import { snapAxis } from "./homepage-snap.js";

const RULER_CLASS = "clans-home__ruler";
const RULER_TOP_CLASS = "clans-home__ruler--top";
const RULER_LEFT_CLASS = "clans-home__ruler--left";
const CORNER_CLASS = "clans-home__ruler-corner";
const CANVAS_W = 960;

interface CreateCtx {
    readonly ruler: Instance;
    readonly canvas: HTMLElement;
    readonly axis: GuideAxis;
    readonly state: EditorState;
    scale: number;
    guideId: string | null;
}

function snappedPosition(ctx: CreateCtx, e: PointerEvent): number {
    const raw = positionFromPointer(ctx, e);
    return e.ctrlKey ? raw : snapAxis(ctx.axis, raw, ctx.state.draft$());
}

function pointerInsideCanvas(canvas: HTMLElement, e: PointerEvent): boolean {
    const r = canvas.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
}

function positionFromPointer(ctx: CreateCtx, e: PointerEvent): number {
    const r = ctx.canvas.getBoundingClientRect();
    const raw = ctx.axis === "x" ? (e.clientX - r.left) * ctx.scale : (e.clientY - r.top) * ctx.scale;
    return Math.max(0, raw);
}

function onRulerDown(ctx: CreateCtx, e: PointerEvent): void {
    const rect = ctx.canvas.getBoundingClientRect();
    ctx.scale = rect.width > 0 ? CANVAS_W / rect.width : 1;
    ctx.guideId = ctx.state.addGuide(ctx.axis, snappedPosition(ctx, e));
    ctx.ruler.el.setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
}

function onRulerMove(ctx: CreateCtx, e: PointerEvent): void {
    if (ctx.guideId === null) return;
    ctx.state.moveGuide(ctx.guideId, snappedPosition(ctx, e));
}

function onRulerUp(ctx: CreateCtx, e: PointerEvent): void {
    if (ctx.guideId === null) return;
    if (ctx.ruler.el.hasPointerCapture(e.pointerId)) ctx.ruler.el.releasePointerCapture(e.pointerId);
    if (!pointerInsideCanvas(ctx.canvas, e)) ctx.state.removeGuide(ctx.guideId);
    ctx.guideId = null;
}

function onRulerCancel(ctx: CreateCtx, e: PointerEvent): void {
    if (ctx.guideId === null) return;
    if (ctx.ruler.el.hasPointerCapture(e.pointerId)) ctx.ruler.el.releasePointerCapture(e.pointerId);
    ctx.state.removeGuide(ctx.guideId);
    ctx.guideId = null;
}

function attachRulerDrag(ruler: Instance, canvas: HTMLElement, axis: GuideAxis, state: EditorState): void {
    const ctx: CreateCtx = { ruler, canvas, axis, state, scale: 1, guideId: null };
    const dispose = wirePointerDrag(ruler.el, {
        down: (e) => onRulerDown(ctx, e),
        move: (e) => onRulerMove(ctx, e),
        up: (e) => onRulerUp(ctx, e),
        cancel: (e) => onRulerCancel(ctx, e),
    });
    ruler.trackDispose({ dispose });
}

function buildRuler(axis: GuideAxis, canvas: HTMLElement, state: EditorState): Instance {
    const variant = axis === "x" ? RULER_TOP_CLASS : RULER_LEFT_CLASS;
    const ruler = div(baseProps([RULER_CLASS, variant]));
    attachRulerDrag(ruler, canvas, axis, state);
    return ruler;
}

export function buildRulers(canvas: Instance, state: EditorState): Instance {
    const corner = div(baseProps([CORNER_CLASS]));
    const top = buildRuler("x", canvas.el, state);
    const left = buildRuler("y", canvas.el, state);
    const group = div(baseProps(["clans-home__rulers"]), [corner, top, left]);
    group.trackDispose(
        effect(() => {
            group.toggleClass("is-on", state.guidesEnabled$());
        }),
    );
    return group;
}
