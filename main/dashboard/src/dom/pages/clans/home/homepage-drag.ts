import { div, effect, icon, type Instance } from "../../../factory";
import { wirePointerDrag } from "../../../factory/events/pointer-wirer.js";
import { setDynProps } from "../../../../state/dynamic-styles.js";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import type { EditorState } from "./homepage-editor-state.js";

const SELECT_OUTLINE_CLASS = "is-selected";
const GRIP_CLASS = "clans-home__grip";
const GRIP_OPEN_CLASS = "is-open";

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

function attachGripDrag(grip: Instance, host: Instance, componentId: string, state: EditorState): void {
    const session: DragSession = { downX: 0, downY: 0, baseX: 0, baseY: 0, dragging: false };
    function endDrag(e: PointerEvent): void {
        if (!session.dragging) return;
        session.dragging = false;
        if (grip.el.hasPointerCapture(e.pointerId)) grip.el.releasePointerCapture(e.pointerId);
    }
    const dispose = wirePointerDrag(grip.el, {
        down: (e: PointerEvent) => {
            if (!state.editing$()) return;
            state.select(componentId);
            const comp = findById(state, componentId);
            if (!comp) return;
            state.beginDragHistory();
            session.downX = e.clientX;
            session.downY = e.clientY;
            session.baseX = comp.canvasX;
            session.baseY = comp.canvasY;
            session.dragging = true;
            grip.el.setPointerCapture(e.pointerId);
            e.preventDefault();
            e.stopPropagation();
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
        up: endDrag,
        cancel: endDrag,
    });
    grip.trackDispose({ dispose });
}

export function attachComponentEditor(host: Instance, componentId: string, state: EditorState): void {
    host.trackDispose(
        effect(() => {
            host.toggleClass(SELECT_OUTLINE_CLASS, state.selectedId$() === componentId);
        }),
    );
    host.el.addEventListener("click", (e) => {
        if (!state.editing$()) return;
        const target = e.target as Element | null;
        if (target?.closest(".clans-home__frame, .clans-home__handle, .clans-home__grip")) return;
        state.select(componentId);
    });
    const grip = div(
        {
            classes: [GRIP_CLASS],
            ariaLabel: "Drag to move component",
            title: "Drag to move",
            context: "drag handle for moving the component",
            meta: ["action"],
        },
        [icon({ name: "arrows-move", context: null, meta: null }).el],
    );
    attachGripDrag(grip, host, componentId, state);
    host.addChild(grip);
    host.trackDispose(
        effect(() => {
            grip.toggleClass(GRIP_OPEN_CLASS, state.selectedId$() === componentId);
        }),
    );
}
