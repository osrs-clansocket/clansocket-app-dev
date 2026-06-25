import { BTN_VARIANT_OUTLINE, button, div, input, paragraph, span, type Child, type Instance } from "../../../factory";
import { profileStore } from "../../../../ai/profile-store";
import {
    EMPTY_CLASS,
    FIELD_LABEL_CLASS,
    HEADER_ROW_CLASS,
    INLINE_INPUT_CLASS,
    LIST_ROW_CLASS,
    ROW_ACTIONS_CLASS,
    ROW_CLASS,
    ROW_EDITING_CLASS,
    ROW_PRIMARY_CLASS,
    SURFACE_ROW_CLASS,
    getEditing,
    setEditing,
} from "./state.js";
import { iconBtn } from "./shared.js";

function buildHeaderChildren(
    focus: string | null,
    editing: ReturnType<typeof getEditing>,
    rerender: () => void,
): Child[] {
    const children: Child[] = [span({ classes: [FIELD_LABEL_CLASS], text: "Focus", context: null, meta: null })];
    if (focus === null && editing?.kind !== "edit-focus") {
        children.push(
            button({
                variant: BTN_VARIANT_OUTLINE,
                compact: true,
                text: "+ set",
                ariaLabel: "Set focus",
                context: "set a focus thread phrase",
                meta: ["action"],
                onClick: () => {
                    setEditing({ kind: "edit-focus" });
                    rerender();
                },
            }),
        );
    }
    return children;
}

function buildFocusInput(args: {
    focus: string | null;
    save: () => void;
    cancel: () => void;
}): Instance<HTMLInputElement> {
    return input({
        classes: [INLINE_INPUT_CLASS, ROW_PRIMARY_CLASS],
        value: args.focus ?? "",
        placeholder: "Current thread phrase",
        ariaLabel: "Focus value",
        context: "enter the focus thread phrase",
        meta: ["input"],
        onKeydown: (e: KeyboardEvent) => {
            const handler: Record<string, (() => void) | undefined> = { Enter: args.save, Escape: args.cancel };
            const fn = handler[e.key];
            if (!fn) return;
            e.preventDefault();
            fn();
        },
    });
}

function exitEditing(rerender: () => void): void {
    setEditing(null);
    rerender();
}

function renderEditingRow(root: Instance, focus: string | null, rerender: () => void): void {
    const ref: { input: Instance<HTMLInputElement> | null } = { input: null };
    const save = (): void => {
        const v = ref.input!.el.value.trim();
        profileStore.setFocus(v.length > 0 ? v : null);
        exitEditing(rerender);
    };
    const cancel = (): void => exitEditing(rerender);
    ref.input = buildFocusInput({ focus, save, cancel });
    root.addChild(
        div({ classes: [ROW_CLASS, ROW_EDITING_CLASS, LIST_ROW_CLASS, SURFACE_ROW_CLASS], context: null, meta: null }, [
            ref.input,
            div({ classes: [ROW_ACTIONS_CLASS], context: null, meta: null }, [
                iconBtn("check-lg", "save", save),
                iconBtn("x-lg", "cancel", cancel),
            ]),
        ]),
    );
    queueMicrotask(() => ref.input!.el.focus());
}

function renderValueRow(root: Instance, focus: string, rerender: () => void): void {
    root.addChild(
        div({ classes: [ROW_CLASS, LIST_ROW_CLASS, SURFACE_ROW_CLASS], context: null, meta: null }, [
            span({ classes: [ROW_PRIMARY_CLASS], text: focus, context: null, meta: null }),
            div({ classes: [ROW_ACTIONS_CLASS], context: null, meta: null }, [
                iconBtn("pencil", "edit", () => {
                    setEditing({ kind: "edit-focus" });
                    rerender();
                }),
                iconBtn("trash", "remove", () => {
                    profileStore.setFocus(null);
                    rerender();
                }),
            ]),
        ]),
    );
}

export function renderFocus(host: Instance, focus: string | null, rerender: () => void): void {
    const editing = getEditing();
    host.addChild(
        div({ classes: [HEADER_ROW_CLASS], context: null, meta: null }, buildHeaderChildren(focus, editing, rerender)),
    );
    if (editing?.kind === "edit-focus") {
        renderEditingRow(host, focus, rerender);
        return;
    }
    if (focus === null) {
        host.addChild(paragraph({ classes: [EMPTY_CLASS], text: "No focus set", context: null, meta: null }));
        return;
    }
    renderValueRow(host, focus, rerender);
}
