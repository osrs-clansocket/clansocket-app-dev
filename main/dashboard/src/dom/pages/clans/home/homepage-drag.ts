import { div, effect, icon, type Instance } from "../../../factory";
import type { EditorState } from "./homepage-editor-state.js";
import { attachHostDrag } from "./homepage-drag-session.js";

const SELECT_OUTLINE_CLASS = "is-selected";
const GRIP_CLASS = "clans-home__grip";
const GRIP_OPEN_CLASS = "is-open";

export function attachComponentEditor(host: Instance, componentId: string, state: EditorState): void {
    host.trackDispose(
        effect(() => {
            host.toggleClass(SELECT_OUTLINE_CLASS, state.selectedId$() === componentId);
        }),
    );
    host.el.addEventListener("click", (e) => {
        if (!state.editing$()) return;
        const target = e.target as Element | null;
        if (target?.closest(".clans-home__frame, .clans-home__handle")) return;
        state.select(componentId);
    });
    attachHostDrag(host, componentId, state);
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
    host.addChild(grip);
    host.trackDispose(
        effect(() => {
            grip.toggleClass(GRIP_OPEN_CLASS, state.selectedId$() === componentId);
        }),
    );
}
