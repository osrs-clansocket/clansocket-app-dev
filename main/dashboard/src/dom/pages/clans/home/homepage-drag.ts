import { effect, type Instance } from "../../../factory";
import { wirePointerDrag } from "../../../factory/events/pointer-wirer.js";
import { setDynProps } from "../../../../state/dynamic-styles.js";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import type { EditorState } from "./homepage-editor-state.js";

const SELECT_OUTLINE_CLASS = "is-selected";

interface DragSession {
    downX: number;
    downY: number;
    baseX: number;
    baseY: number;
    dragging: boolean;
}

function findById(state: EditorState, componentId: string): HomepageComponent | undefined {
    return state.draft$().find((c) => c.componentId === componentId);
}

function endDrag(host: Instance, session: DragSession, e: PointerEvent): void {
    if (!session.dragging) return;
    session.dragging = false;
    host.el.releasePointerCapture(e.pointerId);
}

export function attachComponentEditor(host: Instance, componentId: string, state: EditorState): void {
    const session: DragSession = { downX: 0, downY: 0, baseX: 0, baseY: 0, dragging: false };
    host.trackDispose(
        effect(() => {
            host.toggleClass(SELECT_OUTLINE_CLASS, state.selectedId$() === componentId);
        }),
    );
    const dispose = wirePointerDrag(host.el, {
        down: (e: PointerEvent) => {
            if (!state.editing$()) return;
            const target = e.target as Element | null;
            if (target?.closest(".clans-home__frame, .clans-home__handle")) return;
            if (target?.closest(".clans-home__component-text, .clans-home__kpi-label, .clans-home__kpi-value")) {
                return;
            }
            state.select(componentId);
            const comp = findById(state, componentId);
            if (!comp) return;
            state.beginDragHistory();
            session.downX = e.clientX;
            session.downY = e.clientY;
            session.baseX = comp.canvasX;
            session.baseY = comp.canvasY;
            session.dragging = true;
            host.el.setPointerCapture(e.pointerId);
            e.preventDefault();
        },
        move: (e: PointerEvent) => {
            if (!session.dragging) return;
            const comp = findById(state, componentId);
            if (!comp) return;
            const liveX = session.baseX + (e.clientX - session.downX);
            const liveY = session.baseY + (e.clientY - session.downY);
            const dx = liveX - comp.canvasX;
            const dy = liveY - comp.canvasY;
            if (dx !== 0 || dy !== 0) state.moveComponent(componentId, dx, dy);
            setDynProps(host.el, { "--clan-home-x": String(liveX), "--clan-home-y": String(liveY) });
        },
        up: (e: PointerEvent) => endDrag(host, session, e),
        cancel: (e: PointerEvent) => endDrag(host, session, e),
    });
    host.trackDispose({ dispose });
}
