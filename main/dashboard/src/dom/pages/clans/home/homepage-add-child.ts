import { div, span, type Instance, baseProps, textProps } from "../../../factory";
import { signal } from "../../../factory/reactive";
import type { EditorState } from "./homepage-editor-state.js";
import { CHILD_KIND_ENTRIES } from "./homepage-frame-tools.js";
import { toolButton } from "./homepage-frame-button.js";
import { popoverCloseBtn } from "./homepage-popover-close.js";

const POPOVER_CLASS = "clans-home__add-child-popover";
const ROW_CLASS = "clans-home__add-child-row";
const LABEL_CLASS = "clans-home__add-child-label";
const HEAD_CLASS = "clans-home__add-child-head";

export function buildAddChild(
    state: EditorState,
    parentId: string,
    openProp$: ReturnType<typeof signal<string | null>>,
): Instance {
    const popover = div(baseProps([POPOVER_CLASS]));
    popover.addChild(div(baseProps([HEAD_CLASS]), [popoverCloseBtn(() => openProp$.set(null))]));
    for (const entry of CHILD_KIND_ENTRIES) {
        const trigger = toolButton({
            name: entry.name,
            label: entry.label,
            active$: () => false,
            onClick: () => {
                state.addChildComponent(entry.id, parentId);
                openProp$.set(null);
            },
        });
        const row = div(baseProps([ROW_CLASS]), [
            trigger,
            span(textProps([LABEL_CLASS], entry.label)),
        ]);
        popover.addChild(row);
    }
    return popover;
}
