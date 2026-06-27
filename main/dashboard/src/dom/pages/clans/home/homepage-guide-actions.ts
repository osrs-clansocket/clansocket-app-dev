import { div, type Instance, baseProps } from "../../../factory";
import { buildGlassColor } from "../../../forms/glass/inputs/color/index.js";
import type { EditorState } from "./homepage-editor-state.js";
import type { Guide } from "./homepage-guides-state.js";
import { toolButton } from "./homepage-frame-button.js";

const ACTIONS_CLASS = "clans-home__guide-actions";

function currentGuide(state: EditorState, id: string): Guide | undefined {
    return state.guides$().find((g) => g.id === id);
}

function isLocked(state: EditorState, id: string): boolean {
    return currentGuide(state, id)?.locked ?? false;
}

function isDashed(state: EditorState, id: string): boolean {
    return currentGuide(state, id)?.style === "dashed";
}

function buildLockBtn(state: EditorState, id: string): Instance {
    return toolButton({
        name: "lock-fill",
        label: "Toggle guide lock",
        active$: () => isLocked(state, id),
        onClick: () => state.setGuideLocked(id, !isLocked(state, id)),
    });
}

function buildColorInput(state: EditorState, id: string): Instance {
    return buildGlassColor({
        name: "guide-color",
        ariaLabel: "Pick guide color",
        value: () => currentGuide(state, id)?.color ?? "#d4b85c",
        onChange: (next) => state.setGuideColor(id, next),
    });
}

function buildStyleBtn(state: EditorState, id: string): Instance {
    return toolButton({
        name: "border",
        label: "Toggle solid or dashed line",
        active$: () => isDashed(state, id),
        onClick: () => state.setGuideStyle(id, isDashed(state, id) ? "solid" : "dashed"),
    });
}

function buildDeleteBtn(state: EditorState, id: string): Instance {
    return toolButton({
        name: "trash",
        label: "Delete guide",
        active$: () => false,
        onClick: () => state.removeGuide(id),
    });
}

export function buildGuideActions(g: Guide, state: EditorState): Instance {
    return div(baseProps([ACTIONS_CLASS]), [
        buildLockBtn(state, g.id),
        buildColorInput(state, g.id),
        buildStyleBtn(state, g.id),
        buildDeleteBtn(state, g.id),
    ]);
}
