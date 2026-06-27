import { effect, paragraph, span, type Instance, textProps } from "../../../factory";
import type { BaseProps } from "../../../factory/core";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import { interpolate, type HomepageContext } from "../../../../state/clans/homepage/homepage-variables.js";
import type { EditorState } from "./homepage-editor-state.js";
import { EDITABLE_CLASS, TEXT_DISPLAY_CLASS } from "./component-classes.js";

type PayloadField = "text" | "label" | "value";
type ElementFactory = (props: BaseProps) => Instance;

interface EditableOpts {
    readonly factory: ElementFactory;
    readonly classes: readonly string[];
    readonly initial: string;
    readonly editor: EditorState;
    readonly onCommit: (next: string) => void;
}

export function buildEditable(opts: EditableOpts): Instance {
    const display = opts.factory(textProps([...opts.classes, EDITABLE_CLASS], opts.initial));
    let latest = opts.initial;
    display.trackDispose(
        effect(() => {
            display.el.setAttribute("contenteditable", opts.editor.editing$() ? "true" : "false");
        }),
    );
    display.el.addEventListener("blur", () => {
        if (display.el.getAttribute("contenteditable") !== "true") return;
        const next = (display.el.textContent ?? "").trim();
        if (next === latest) return;
        latest = next;
        opts.onCommit(next);
    });
    return display;
}

function commitField(editor: EditorState, id: string, field: PayloadField): (next: string) => void {
    return (next) => editor.updateText(id, field, next);
}

export function buildTextHostPair(ctx: HomepageContext, c: HomepageComponent, editor: EditorState): Instance[] {
    return [
        buildEditable({
            factory: paragraph,
            classes: [TEXT_DISPLAY_CLASS],
            initial: interpolate(c.payload.text ?? "", ctx),
            editor,
            onCommit: commitField(editor, c.componentId, "text"),
        }),
    ];
}

export function buildKpiPartEditable(
    ctx: HomepageContext,
    c: HomepageComponent,
    editor: EditorState,
    field: "label" | "value",
    cls: string,
): Instance {
    return buildEditable({
        factory: span,
        classes: [cls],
        initial: interpolate(c.payload[field] ?? "", ctx),
        editor,
        onCommit: commitField(editor, c.componentId, field),
    });
}
