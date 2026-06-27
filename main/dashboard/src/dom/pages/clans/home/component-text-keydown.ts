import { exitTextEdit, type TextSwapTargets } from "./component-text-swap.js";

const KEY_ENTER = "Enter";
const KEY_ESCAPE = "Escape";

export function handleTextKeydown(e: KeyboardEvent, targets: TextSwapTargets, seedText: string): void {
    if (e.key === KEY_ENTER) {
        e.preventDefault();
        targets.editor.el.blur();
        return;
    }
    if (e.key === KEY_ESCAPE) {
        e.preventDefault();
        targets.editor.el.value = seedText;
        exitTextEdit(targets);
    }
}
