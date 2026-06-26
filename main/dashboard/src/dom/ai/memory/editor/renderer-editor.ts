import type { Instance } from "../../../factory";
import type { MemoryFile } from "../../../../ai/memory-client";
import { buildEditorForm } from "./form-builder.js";
import { readForm } from "./file-io.js";
import type { EditorCallbacks, Mode } from "./constants.js";

function wireEditor(formEl: HTMLFormElement, mode: Mode, id: string, cb: EditorCallbacks): void {
    formEl.querySelector<HTMLButtonElement>("[data-cancel]")!.addEventListener("click", cb.onCancel);
    const deleteBtn = formEl.querySelector<HTMLButtonElement>("[data-delete]");
    if (deleteBtn) deleteBtn.addEventListener("click", () => cb.onDelete(id));
    formEl.addEventListener("submit", (e) => {
        e.preventDefault();
        cb.onSave(readForm(formEl), mode);
    });
}

export function renderEditor(container: Instance, mode: Mode, file: MemoryFile, cb: EditorCallbacks): void {
    const formInst = buildEditorForm(file, mode);
    container.setChildren(formInst);
    wireEditor(formInst.el, mode, file.id, cb);
}
