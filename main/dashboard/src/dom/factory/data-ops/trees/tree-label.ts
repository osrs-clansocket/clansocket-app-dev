import { input } from "../../content-ops/form/input-label.js";
import { span } from "../../content-ops/text.js";
import { wireDblClick } from "../../events/simple-wirer.js";
import type { Instance } from "../../core/index.js";

const TREE_LABEL_CLASS = "tree__label";
const TREE_LABEL_INPUT_CLASS = "tree__label-input";
const KEY_ENTER = "Enter";
const KEY_ESCAPE = "Escape";

export type OnLabelEdit = (next: string) => Promise<boolean>;

export interface LabelKit {
    elements: Instance[];
    enterEdit?: () => void;
}

export interface LabelOptions {
    enableDblClick?: boolean;
}

interface EditorOps {
    enterEdit: () => void;
    cancelEdit: () => void;
    commitEdit: () => Promise<void>;
}

interface EditorRefs {
    display: Instance;
    editor: Instance<HTMLInputElement>;
    editingRef: { v: boolean };
}

function exitEditMode(refs: EditorRefs): void {
    refs.editingRef.v = false;
    refs.editor.el.hidden = true;
    refs.display.el.hidden = false;
}

function makeEditorOps(refs: EditorRefs, label: string, onEdit: OnLabelEdit): EditorOps {
    const cancelEdit = (): void => {
        if (refs.editingRef.v) exitEditMode(refs);
    };
    const commitEdit = async (): Promise<void> => {
        if (!refs.editingRef.v) return;
        const next = refs.editor.el.value.trim();
        exitEditMode(refs);
        if (next.length === 0 || next === label) return;
        await onEdit(next);
    };
    const enterEdit = (): void => {
        if (refs.editingRef.v) return;
        refs.editingRef.v = true;
        refs.editor.el.value = label;
        refs.display.el.hidden = true;
        refs.editor.el.hidden = false;
        refs.editor.el.focus();
        refs.editor.el.select();
    };
    return { enterEdit, cancelEdit, commitEdit };
}

function buildLabelEditor(label: string, opsRef: { ops: EditorOps | null }): Instance<HTMLInputElement> {
    const editor: Instance<HTMLInputElement> = input({
        classes: [TREE_LABEL_INPUT_CLASS],
        type: "text",
        value: label,
        ariaLabel: `Rename ${label}`,
        hidden: "",
        context: "rename the item",
        meta: ["input"],
        onClick: { handler: (e) => e.stopPropagation(), raw: true },
        onKeydown: (e) => {
            if (e.key === KEY_ENTER) {
                e.preventDefault();
                editor.el.blur();
                return;
            }
            if (e.key === KEY_ESCAPE) {
                e.preventDefault();
                opsRef.ops?.cancelEdit();
            }
        },
        onBlur: () => void opsRef.ops?.commitEdit(),
    });
    return editor;
}

export function labelOrEditor(
    label: string,
    onLabelEdit: OnLabelEdit | undefined,
    options: LabelOptions = {},
): LabelKit {
    const display = span({ classes: [TREE_LABEL_CLASS], text: label, context: null, meta: null });
    if (!onLabelEdit) return { elements: [display] };
    const editingRef = { v: false };
    const opsRef: { ops: EditorOps | null } = { ops: null };
    const editor = buildLabelEditor(label, opsRef);
    opsRef.ops = makeEditorOps({ display, editor, editingRef }, label, onLabelEdit);
    if (options.enableDblClick !== false) wireDblClick(display.el, opsRef.ops.enterEdit);
    return { elements: [display, editor], enterEdit: opsRef.ops.enterEdit };
}
