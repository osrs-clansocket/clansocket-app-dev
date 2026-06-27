import { div, effect, type Instance, baseProps } from "../../../factory";
import { wirePointerDrag } from "../../../factory/events/pointer-wirer.js";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import type { EditorState } from "./homepage-editor-state.js";
import { snapResize } from "./homepage-snap.js";

const HANDLE_GRID_CLASS = "clans-home__handles";
const HANDLE_GRID_OPEN_CLASS = "is-open";
const HANDLE_CLASS = "clans-home__handle";

type Dir = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const DIRS: ReadonlyArray<Dir> = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

interface ResizeSession {
    baseX: number;
    baseY: number;
    baseW: number;
    baseH: number;
    downClientX: number;
    downClientY: number;
    scale: number;
    active: boolean;
}

const CANVAS_W = 960;

function findComponent(state: EditorState, id: string): HomepageComponent | undefined {
    return state.draft$().find((c) => c.componentId === id);
}

function canvasScale(host: HTMLElement): number {
    const canvasEl = host.closest(".clans-home__canvas");
    if (!(canvasEl instanceof HTMLElement)) return 1;
    const rect = canvasEl.getBoundingClientRect();
    return rect.width > 0 ? CANVAS_W / rect.width : 1;
}

function applyResize(
    dir: Dir,
    s: ResizeSession,
    dx: number,
    dy: number,
): { x: number; y: number; w: number; h: number } {
    let x = s.baseX;
    let y = s.baseY;
    let w = s.baseW;
    let h = s.baseH;
    if (dir.includes("n")) {
        y = s.baseY + dy;
        h = s.baseH - dy;
    }
    if (dir.includes("s")) {
        h = s.baseH + dy;
    }
    if (dir.includes("w")) {
        x = s.baseX + dx;
        w = s.baseW - dx;
    }
    if (dir.includes("e")) {
        w = s.baseW + dx;
    }
    return { x, y, w, h };
}

function buildHandle(host: Instance, dir: Dir, state: EditorState, id: string): Instance {
    const session: ResizeSession = {
        baseX: 0,
        baseY: 0,
        baseW: 0,
        baseH: 0,
        downClientX: 0,
        downClientY: 0,
        scale: 1,
        active: false,
    };
    const handle = div(
        {
            classes: [HANDLE_CLASS, `${HANDLE_CLASS}--${dir}`],
            ariaLabel: `Resize from ${dir.toUpperCase()} corner`,
            context: `resize the selected component from the ${dir} corner`,
            meta: ["action"],
        },
        [],
    );
    const dispose = wirePointerDrag(handle.el, {
        down: (e: PointerEvent) => {
            const comp = findComponent(state, id);
            if (!comp) return;
            state.beginDragHistory();
            session.baseX = comp.canvasX;
            session.baseY = comp.canvasY;
            session.baseW = comp.canvasW;
            session.baseH = comp.canvasH;
            session.downClientX = e.clientX;
            session.downClientY = e.clientY;
            session.scale = canvasScale(host.el);
            session.active = true;
            handle.el.setPointerCapture(e.pointerId);
            e.preventDefault();
            e.stopPropagation();
        },
        move: (e: PointerEvent) => {
            if (!session.active) return;
            const dx = (e.clientX - session.downClientX) * session.scale;
            const dy = (e.clientY - session.downClientY) * session.scale;
            let next = applyResize(dir, session, dx, dy);
            if (state.guidesEnabled$() && !e.ctrlKey) next = snapResize(dir, next, state.guides$());
            state.resizeComponent(id, next.x, next.y, next.w, next.h);
        },
        up: (e: PointerEvent) => {
            if (!session.active) return;
            session.active = false;
            handle.el.releasePointerCapture(e.pointerId);
        },
        cancel: (e: PointerEvent) => {
            if (!session.active) return;
            session.active = false;
            handle.el.releasePointerCapture(e.pointerId);
        },
    });
    handle.trackDispose({ dispose });
    return handle;
}

export function attachResizeHandles(host: Instance, id: string, state: EditorState): void {
    const grid = div(baseProps([HANDLE_GRID_CLASS]));
    for (const dir of DIRS) grid.addChild(buildHandle(host, dir, state, id));
    host.addChild(grid);
    host.trackDispose(
        effect(() => {
            grid.toggleClass(HANDLE_GRID_OPEN_CLASS, state.selectedId$() === id);
        }),
    );
}

export function fitToContent(host: Instance, id: string, state: EditorState): void {
    const comp = findComponent(state, id);
    if (!comp) return;
    const el = host.el;
    const prevWidth = el.style.inlineSize;
    const prevHeight = el.style.blockSize;
    el.style.inlineSize = "max-content";
    el.style.blockSize = "max-content";
    const rect = el.getBoundingClientRect();
    el.style.inlineSize = prevWidth;
    el.style.blockSize = prevHeight;
    const w = Math.ceil(rect.width);
    const h = Math.ceil(rect.height);
    state.resizeComponent(id, comp.canvasX, comp.canvasY, w, h);
}
