import type { EditorState } from "./homepage-editor-state.js";

const MOVE_STEP = 1;
const MOVE_STEP_SHIFT = 10;
const ARROW_LEFT = "ArrowLeft";
const ARROW_RIGHT = "ArrowRight";
const ARROW_UP = "ArrowUp";
const ARROW_DOWN = "ArrowDown";
const DELETE_KEY = "Delete";
const BACKSPACE_KEY = "Backspace";
const ESCAPE_KEY = "Escape";

function isArrow(key: string): boolean {
    return key === ARROW_LEFT || key === ARROW_RIGHT || key === ARROW_UP || key === ARROW_DOWN;
}

function isEditingInputElement(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    const ce = target.getAttribute("contenteditable");
    if (ce !== null && ce !== "false") return true;
    const closest = target.closest("[contenteditable]");
    if (closest !== null && closest.getAttribute("contenteditable") !== "false") return true;
    return false;
}

function moveDelta(key: string, step: number): { dx: number; dy: number } {
    if (key === ARROW_LEFT) return { dx: -step, dy: 0 };
    if (key === ARROW_RIGHT) return { dx: step, dy: 0 };
    if (key === ARROW_UP) return { dx: 0, dy: -step };
    return { dx: 0, dy: step };
}

function handleArrow(e: KeyboardEvent, state: EditorState, id: string): void {
    e.preventDefault();
    const step = e.shiftKey ? MOVE_STEP_SHIFT : MOVE_STEP;
    const { dx, dy } = moveDelta(e.key, step);
    state.beginDragHistory();
    state.moveComponent(id, dx, dy);
}

function handleUndoRedo(e: KeyboardEvent, state: EditorState): boolean {
    if (!e.ctrlKey && !e.metaKey) return false;
    if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        state.undo();
        return true;
    }
    if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        state.redo();
        return true;
    }
    return false;
}

export function attachKeyboard(state: EditorState): () => void {
    function onKey(e: KeyboardEvent): void {
        if (!state.editing$()) return;
        if (isEditingInputElement(e.target)) return;
        if (handleUndoRedo(e, state)) return;
        const id = state.selectedId$();
        if (e.key === ESCAPE_KEY) {
            state.select(null);
            return;
        }
        if (id === null) return;
        if (e.key === DELETE_KEY || e.key === BACKSPACE_KEY) {
            e.preventDefault();
            state.deleteSelected();
            return;
        }
        if (isArrow(e.key)) {
            handleArrow(e, state, id);
        }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
}
