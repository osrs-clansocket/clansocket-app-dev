import { div, effect, type Instance, baseProps } from "../../../factory";
import { wirePointerDrag } from "../../../factory/events/pointer-wirer.js";
import { reconcile } from "../../../factory/live-ops/reconcile.js";
import { setDynProps } from "../../../../state/dynamic-styles.js";
import type { EditorState } from "./homepage-editor-state.js";
import type { Guide } from "./homepage-guides-state.js";
import { buildGuideActions } from "./homepage-guide-actions.js";
import { snapAxis } from "./homepage-snap.js";

const LAYER_CLASS = "clans-home__guides-layer";
const GUIDE_CLASS = "clans-home__guide";
const GUIDE_X_CLASS = "clans-home__guide--x";
const GUIDE_Y_CLASS = "clans-home__guide--y";
const DASHED_CLASS = "clans-home__guide--dashed";
const LOCKED_CLASS = "clans-home__guide--locked";
const REMOVE_HOVER_CLASS = "is-remove";
const ACTIONS_SELECTOR = ".clans-home__guide-actions";
const CANVAS_W = 960;
const MENU_OFFSET_Y = 5;

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
    setDynProps(host.el, {
        "--guide-pos": String(g.position),
        "--guide-color": g.color,
    });
    host.toggleClass(DASHED_CLASS, g.style === "dashed");
    host.toggleClass(LOCKED_CLASS, g.locked);
}

function isGuideLocked(state: EditorState, id: string): boolean {
    return state.guides$().find((g) => g.id === id)?.locked ?? false;
}

function onGuideDown(ctx: GuideDragCtx, e: PointerEvent): void {
    if ((e.target as Element | null)?.closest(ACTIONS_SELECTOR)) return;
    if (isGuideLocked(ctx.state, ctx.id)) return;
    const current = ctx.state.guides$().find((g) => g.id === ctx.id);
    if (current === undefined) return;
    const rect = ctx.canvas.getBoundingClientRect();
    ctx.scale = rect.width > 0 ? CANVAS_W / rect.width : 1;
    ctx.base = current.position;
    ctx.downClient = ctx.axis === "x" ? e.clientX : e.clientY;
    ctx.dragging = true;
    ctx.host.el.setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
}

function onGuideMove(ctx: GuideDragCtx, e: PointerEvent): void {
    if (!ctx.dragging) return;
    const delta = (ctx.axis === "x" ? e.clientX : e.clientY) - ctx.downClient;
    const raw = ctx.base + delta * ctx.scale;
    const snapped = e.ctrlKey ? raw : snapAxis(ctx.axis, raw, ctx.state.draft$());
    ctx.state.moveGuide(ctx.id, snapped);
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
        down: (e) => onGuideDown(ctx, e),
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
        host.addChild(buildGuideActions(g, state));
        host.el.addEventListener("pointerenter", (e) => {
            const r = host.el.getBoundingClientRect();
            setDynProps(host.el, {
                "--menu-x": `${e.clientX - r.left}px`,
                "--menu-y": `${e.clientY - r.top + MENU_OFFSET_Y}px`,
            });
        });
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
