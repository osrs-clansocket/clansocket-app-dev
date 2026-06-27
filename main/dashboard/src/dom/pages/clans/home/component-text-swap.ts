import type { Instance } from "../../../factory";

export interface TextSwapTargets {
    display: Instance;
    editor: Instance<HTMLInputElement>;
}

export function exitTextEdit(targets: TextSwapTargets): void {
    targets.editor.setAttr("hidden", "");
    targets.display.removeAttr("hidden");
}

export function enterTextEdit(targets: TextSwapTargets, seedText: string): void {
    targets.display.setAttr("hidden", "");
    targets.editor.removeAttr("hidden");
    targets.editor.el.value = seedText;
    targets.editor.el.focus();
    targets.editor.el.select();
}
