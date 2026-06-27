import type { Instance } from "../../../factory";
import { wirePointerDrag } from "../../../factory/events/pointer-wirer.js";
import { setDynProps } from "../../../../state/dynamic-styles.js";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import type { EditorState } from "./homepage-editor-state.js";
import { snapPosition } from "./homepage-snap.js";

const DROP_TARGET_CLASS = "is-drop-target";
const CONTAINER_KIND = "container";
const CANVAS_W = 960;
const CHROME_SELECTOR = ".clans-home__frame, .clans-home__handle";
const EDITABLE_SELECTOR = "[contenteditable='true']";

export interface DragSession {
    downX: number;
    downY: number;
    baseX: number;
    baseY: number;
    scale: number;
    dragging: boolean;
    hoverTarget: HTMLElement | null;
}

export interface DragCtx {
    host: Instance;
    componentId: string;
    state: EditorState;
    session: DragSession;
}

function findById(state: EditorState, componentId: string): HomepageComponent | undefined {
    return state.draft$().find((c) => c.componentId === componentId);
}

function isContainerEl(el: Element | null): el is HTMLElement {
    return el instanceof HTMLElement && el.dataset.componentKind === CONTAINER_KIND;
}

function containerAt(host: HTMLElement, clientX: number, clientY: number): HTMLElement | null {
    const stack = document.elementsFromPoint(clientX, clientY);
    for (const el of stack) {
        if (isContainerEl(el) && el !== host && !host.contains(el)) return el;
    }
    return null;
}

function clearHover(session: DragSession): void {
    if (session.hoverTarget !== null) {
        session.hoverTarget.classList.remove(DROP_TARGET_CLASS);
        session.hoverTarget = null;
    }
}

function setHover(session: DragSession, target: HTMLElement | null): void {
    if (session.hoverTarget === target) return;
    clearHover(session);
    if (target !== null) {
        target.classList.add(DROP_TARGET_CLASS);
        session.hoverTarget = target;
    }
}

function commitDrop(ctx: DragCtx, e: PointerEvent): void {
    const comp = findById(ctx.state, ctx.componentId);
    if (comp === undefined || comp.componentName === CONTAINER_KIND) return;
    const target = containerAt(ctx.host.el, e.clientX, e.clientY);
    const targetId = target?.dataset.componentId ?? null;
    if (targetId === null || targetId === comp.parentId) return;
    ctx.state.setParent(ctx.componentId, targetId);
}

function canvasScale(host: HTMLElement): number {
    const canvasEl = host.closest(".clans-home__canvas");
    if (!(canvasEl instanceof HTMLElement)) return 1;
    const rect = canvasEl.getBoundingClientRect();
    return rect.width > 0 ? CANVAS_W / rect.width : 1;
}

function shouldStartDrag(target: Element | null): boolean {
    if (target === null) return true;
    if (target.closest(CHROME_SELECTOR) !== null) return false;
    if (target.closest(EDITABLE_SELECTOR) !== null) return false;
    return true;
}

function onDown(ctx: DragCtx, e: PointerEvent): void {
    if (!ctx.state.editing$()) return;
    if (!shouldStartDrag(e.target as Element | null)) return;
    ctx.state.select(ctx.componentId);
    const comp = findById(ctx.state, ctx.componentId);
    if (!comp) return;
    ctx.state.beginDragHistory();
    ctx.session.downX = e.clientX;
    ctx.session.downY = e.clientY;
    ctx.session.baseX = comp.canvasX;
    ctx.session.baseY = comp.canvasY;
    ctx.session.scale = canvasScale(ctx.host.el);
    ctx.session.dragging = true;
    ctx.host.el.setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
}

function onMove(ctx: DragCtx, e: PointerEvent): void {
    if (!ctx.session.dragging) return;
    const comp = findById(ctx.state, ctx.componentId);
    if (!comp) return;
    let liveX = ctx.session.baseX + (e.clientX - ctx.session.downX) * ctx.session.scale;
    let liveY = ctx.session.baseY + (e.clientY - ctx.session.downY) * ctx.session.scale;
    if (ctx.state.guidesEnabled$() && !e.ctrlKey) {
        const snapped = snapPosition(
            { x: liveX, y: liveY, w: comp.canvasW, h: comp.canvasH },
            ctx.state.guides$(),
        );
        liveX = snapped.x;
        liveY = snapped.y;
    }
    const dx = liveX - comp.canvasX;
    const dy = liveY - comp.canvasY;
    if (dx !== 0 || dy !== 0) ctx.state.moveComponent(ctx.componentId, dx, dy);
    setDynProps(ctx.host.el, { "--clan-home-x": String(liveX), "--clan-home-y": String(liveY) });
    if (comp.componentName !== CONTAINER_KIND) {
        setHover(ctx.session, containerAt(ctx.host.el, e.clientX, e.clientY));
    }
}

function onEnd(ctx: DragCtx, e: PointerEvent): void {
    if (!ctx.session.dragging) return;
    ctx.session.dragging = false;
    commitDrop(ctx, e);
    clearHover(ctx.session);
    if (ctx.host.el.hasPointerCapture(e.pointerId)) ctx.host.el.releasePointerCapture(e.pointerId);
}

export function attachHostDrag(host: Instance, componentId: string, state: EditorState): void {
    const session: DragSession = {
        downX: 0,
        downY: 0,
        baseX: 0,
        baseY: 0,
        scale: 1,
        dragging: false,
        hoverTarget: null,
    };
    const ctx: DragCtx = { host, componentId, state, session };
    const dispose = wirePointerDrag(host.el, {
        down: (e: PointerEvent) => onDown(ctx, e),
        move: (e: PointerEvent) => onMove(ctx, e),
        up: (e: PointerEvent) => onEnd(ctx, e),
        cancel: (e: PointerEvent) => onEnd(ctx, e),
    });
    host.trackDispose({ dispose });
}
