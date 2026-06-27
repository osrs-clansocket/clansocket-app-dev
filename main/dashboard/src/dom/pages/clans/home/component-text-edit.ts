import { effect, paragraph, type Instance, textProps } from "../../../factory";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import { interpolate, type HomepageContext } from "../../../../state/clans/homepage/homepage-variables.js";
import type { EditorState } from "./homepage-editor-state.js";
import { TEXT_DISPLAY_CLASS } from "./component-classes.js";

const TEXT_EDITORS = new Map<string, () => void>();

export function triggerTextEdit(componentId: string): boolean {
    const enter = TEXT_EDITORS.get(componentId);
    if (!enter) return false;
    enter();
    return true;
}

export function buildTextHostPair(ctx: HomepageContext, c: HomepageComponent, editor: EditorState): Instance[] {
    const display = paragraph(textProps([TEXT_DISPLAY_CLASS], interpolate(c.payload.text ?? "", ctx)));
    let latestText = c.payload.text ?? "";

    display.trackDispose(
        effect(() => {
            display.el.setAttribute("contenteditable", editor.editing$() ? "true" : "false");
        }),
    );

    display.el.addEventListener("blur", () => {
        if (display.el.getAttribute("contenteditable") !== "true") return;
        const next = (display.el.textContent ?? "").trim();
        if (next === latestText) return;
        latestText = next;
        editor.updateText(c.componentId, next);
    });

    function focusText(): void {
        display.el.focus();
    }

    TEXT_EDITORS.set(c.componentId, focusText);
    display.trackDispose({ dispose: () => TEXT_EDITORS.delete(c.componentId) });
    return [display];
}
