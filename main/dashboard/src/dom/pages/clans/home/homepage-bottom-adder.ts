import { div, type Instance, baseProps } from "../../../factory";
import type { EditorState } from "./homepage-editor-state.js";
import { toolButton } from "./homepage-frame-button.js";

const ADDER_CLASS = "clans-home__bottom-adder";
const TRIGGER_CLASS = "clans-home__bottom-adder-trigger";

export function buildBottomAdder(state: EditorState): Instance {
    const trigger = toolButton({
        name: "plus-circle",
        label: "Add section below",
        active$: () => false,
        onClick: () => state.addBottomSection(),
    });
    trigger.toggleClass(TRIGGER_CLASS, true);
    return div(baseProps([ADDER_CLASS]), [trigger]);
}
