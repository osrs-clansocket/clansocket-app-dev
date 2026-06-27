import type { Instance } from "../../../factory";
import { setDynProps } from "../../../../state/dynamic-styles.js";
import { buildComponentHost } from "./component-host.js";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import { attachComponentEditor } from "./homepage-drag.js";
import { attachComponentFrame } from "./homepage-component-frame.js";
import { attachResizeHandles } from "./homepage-resize.js";
import type { EditorState } from "./homepage-editor-state.js";
import type { HomepageContext } from "../../../../state/clans/homepage/homepage-variables.js";

export const componentKey = (c: HomepageComponent): string => c.componentId;

export function patchComponent(host: Instance, c: HomepageComponent): void {
    setDynProps(host.el, {
        "--clan-home-x": String(c.canvasX),
        "--clan-home-y": String(c.canvasY),
        "--clan-home-w": String(c.canvasW),
        "--clan-home-h": String(c.canvasH),
        "--clan-home-z": String(c.zIndex),
        ...c.tokenOverrides,
    });
}

export function computeContentHeight(items: ReadonlyArray<HomepageComponent>): number {
    let max = 0;
    for (const c of items) {
        if (c.parentId !== null) continue;
        const bottom = c.canvasY + c.canvasH;
        if (bottom > max) max = bottom;
    }
    return max;
}

export function makeCreate(
    ctx: HomepageContext,
    editor: EditorState | null,
): (c: HomepageComponent) => Instance {
    return (c: HomepageComponent): Instance => {
        const host = buildComponentHost(ctx, c, editor);
        if (editor !== null) {
            attachComponentEditor(host, c.componentId, editor);
            attachResizeHandles(host, c.componentId, editor);
            attachComponentFrame(host, c, editor);
        }
        return host;
    };
}
