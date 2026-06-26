import { BTN_VARIANT_OUTLINE, button, input, span, type Instance, baseProps } from "../../../factory";
import type { MetaTag } from "../../../factory/core/semantics/meta-tags.js";
import {
    ACCOUNT_GREETING_EDIT_ROW_CLASS,
    ACCOUNT_GREETING_INPUT_CLASS,
} from "../../../../shared/constants/account-constants.js";

export interface NameEditOpts {
    nameEl: HTMLElement;
    iconEl: HTMLElement;
    onSave: (next: string) => Promise<void> | void;
    ariaLabel?: string;
    context?: string;
    maxLength?: number;
    meta?: readonly MetaTag[];
}

const DEFAULT_ARIA_LABEL = "Display name";
const DEFAULT_CONTEXT = "edit your display name";
const DEFAULT_META: readonly MetaTag[] = ["input", "account"];

function buildNameEditor(
    opts: NameEditOpts,
    ariaLabel: string,
    context: string,
    meta: readonly MetaTag[],
): Instance<HTMLInputElement> {
    return input({
        classes: [ACCOUNT_GREETING_INPUT_CLASS],
        type: "text",
        maxlength: opts.maxLength === undefined ? undefined : String(opts.maxLength),
        autocomplete: "off",
        value: opts.nameEl.textContent ?? "",
        ariaLabel,
        context,
        meta,
    });
}

async function trySaveName(
    editor: Instance<HTMLInputElement>,
    onSave: (v: string) => Promise<void> | void,
    restoreRef: { fn: () => void },
): Promise<void> {
    const value = editor.el.value.trim();
    if (value.length === 0) {
        editor.el.focus();
        return;
    }
    await onSave(value);
    restoreRef.fn();
}

function buildEditButtons(
    editor: Instance<HTMLInputElement>,
    ariaLabel: string,
    onSave: (value: string) => Promise<void> | void,
    restoreRef: { fn: () => void },
): { save: Instance; cancel: Instance } {
    const save = button({
        variant: BTN_VARIANT_OUTLINE,
        
        text: "Save",
        context: `save the new ${ariaLabel.toLowerCase()}`,
        meta: ["submit", "account"],
        onClick: () => trySaveName(editor, onSave, restoreRef),
    });
    const cancel = button({
        
        text: "Cancel",
        context: `cancel editing ${ariaLabel.toLowerCase()}`,
        meta: ["action"],
        onClick: () => restoreRef.fn(),
    });
    return { save, cancel };
}

export function editName(opts: NameEditOpts): void {
    const { nameEl, iconEl, onSave } = opts;
    const ariaLabel = opts.ariaLabel ?? DEFAULT_ARIA_LABEL;
    const context = opts.context ?? DEFAULT_CONTEXT;
    const meta = opts.meta ?? DEFAULT_META;
    const editor = buildNameEditor(opts, ariaLabel, context, meta);
    const restoreRef: { fn: () => void } = { fn: () => undefined };
    const { save, cancel } = buildEditButtons(editor, ariaLabel, onSave, restoreRef);
    const placeholder = span(baseProps([ACCOUNT_GREETING_EDIT_ROW_CLASS]), [editor, save, cancel]);
    nameEl.replaceWith(placeholder.el);
    iconEl.hidden = true;
    editor.el.focus();
    editor.el.select();
    restoreRef.fn = (): void => {
        placeholder.el.replaceWith(nameEl);
        iconEl.hidden = false;
    };
}
