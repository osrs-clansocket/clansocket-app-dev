import { div, span, type Instance, textProps } from "../../../factory";
import { setDynProps } from "../../../../state/dynamic-styles.js";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import type { HomepageContext } from "../../../../state/clans/homepage/homepage-variables.js";
import type { EditorState } from "./homepage-editor-state.js";
import { COMPONENT_CLASS, SPACER_CLASS, variantClass } from "./component-classes.js";
import { buildContent } from "./component-content.js";

function applyPositionAndOverrides(host: Instance, c: HomepageComponent): void {
    setDynProps(host.el, {
        "--clan-home-x": String(c.canvasX),
        "--clan-home-y": String(c.canvasY),
        "--clan-home-w": String(c.canvasW),
        "--clan-home-h": String(c.canvasH),
        "--clan-home-z": String(c.zIndex),
        ...c.tokenOverrides,
    });
}

function attachContent(host: Instance, content: Instance | Instance[] | null): void {
    if (content === null) return;
    if (Array.isArray(content)) {
        for (const ch of content) host.addChild(ch);
        return;
    }
    host.addChild(content);
}

export function buildComponentHost(
    ctx: HomepageContext,
    c: HomepageComponent,
    editor: EditorState | null = null,
): Instance {
    const host = div(
        {
            classes: [COMPONENT_CLASS, variantClass(c.componentName)],
            data: { "component-id": c.componentId, "component-kind": c.componentName },
            context: null,
            meta: null,
        },
        [],
    );
    attachContent(host, buildContent(ctx, c, editor));
    if (c.componentName === "spacer") host.addChild(span(textProps([SPACER_CLASS], "")));
    applyPositionAndOverrides(host, c);
    return host;
}
