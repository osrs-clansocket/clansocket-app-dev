import { effect, paragraph, type Instance, textProps, wireFocus, wireKey } from "../../../factory";
import { wirePointerDown } from "../../../factory/events/pointer-wirer.js";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import { interpolate, type HomepageContext } from "../../../../state/clans/homepage/homepage-variables.js";
import type { EditorState } from "./homepage-editor-state.js";
import { TEXT_DISPLAY_CLASS } from "./component-classes.js";

const KEY_ENTER = "Enter";
const KEY_ESCAPE = "Escape";

const TEXT_EDITORS = new Map<string, () => void>();

export function triggerTextEdit(componentId: string): boolean {
    const enter = TEXT_EDITORS.get(componentId);
    if (!enter) return false;
    enter();
    return true;
}

export function buildTextHostPair(
    ctx: HomepageContext,
    c: HomepageComponent,
    editor: EditorState,
): Instance[] {
    const display = paragraph(textProps([TEXT_DISPLAY_CLASS], ""));
    let latestText = c.payload.text ?? "";

    function applyAttrs(editing: boolean): void {
        const target = editing ? "plaintext-only" : "false";
        if (display.el.getAttribute("contenteditable") !== target) {
            display.el.setAttribute("contenteditable", target);
        }
        const tabTarget = editing ? "0" : "-1";
        if (display.el.getAttribute("tabindex") !== tabTarget) {
            display.el.setAttribute("tabindex", tabTarget);
        }
    }

    function applyText(): void {
        if (document.activeElement === display.el) return;
        const next = interpolate(latestText, ctx);
        if (display.el.textContent !== next) display.el.textContent = next;
    }

    applyAttrs(editor.editing$());
    applyText();

    display.trackDispose(
        effect(() => {
            applyAttrs(editor.editing$());
            applyText();
        }),
    );

    wirePointerDown(display.el, (e: PointerEvent) => {
        if (!editor.editing$()) return;
        e.stopPropagation();
        editor.select(c.componentId);
    });

    wireFocus(display.el, "blur", () => {
        if (display.el.getAttribute("contenteditable") === "false") return;
        const next = (display.el.textContent ?? "").trim();
        if (next === latestText) return;
        latestText = next;
        editor.updateText(c.componentId, next);
    });

    wireKey(display.el, "keydown", (e: KeyboardEvent) => {
        if (e.key === KEY_ENTER && !e.shiftKey) {
            e.preventDefault();
            display.el.blur();
            return;
        }
        if (e.key === KEY_ESCAPE) {
            e.preventDefault();
            display.el.textContent = interpolate(latestText, ctx);
            display.el.blur();
        }
    });

    function focusText(): void {
        display.el.focus({ preventScroll: true });
        const range = document.createRange();
        range.selectNodeContents(display.el);
        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    TEXT_EDITORS.set(c.componentId, focusText);
    display.trackDispose({ dispose: () => TEXT_EDITORS.delete(c.componentId) });
    return [display];
}
