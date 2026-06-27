import { div, effect, type Instance, baseProps } from "../../../factory";
import { signal } from "../../../factory/reactive";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import type { EditorState } from "./homepage-editor-state.js";
import { buildSwatchPopover } from "./token-swatch-popover.js";
import { buildOverrideList } from "./homepage-override-list.js";
import { buildImageSourcePopover } from "./homepage-image-source-popover.js";
import { buildAddChild } from "./homepage-add-child.js";
import { PROP_TOOLS, type FrameContext } from "./homepage-frame-tools.js";
import { attachFrameSides } from "./homepage-frame-sides.js";

const FRAME_CLASS = "clans-home__frame";
const FRAME_OPEN_CLASS = "is-open";
const POPOVER_HOST_CLASS = "clans-home__frame-popover-host";

const POPOVER_OVERRIDES_ID = "info";
const POPOVER_IMAGE_SOURCE_ID = "image-source";
const POPOVER_ADD_CHILD_ID = "add-child";

type OpenSignal = ReturnType<typeof signal<string | null>>;

function buildPopoverContent(openId: string, state: EditorState, id: string, open$: OpenSignal): Instance | null {
    if (openId === POPOVER_OVERRIDES_ID) return buildOverrideList(state, id);
    if (openId === POPOVER_IMAGE_SOURCE_ID) return buildImageSourcePopover(state, id);
    if (openId === POPOVER_ADD_CHILD_ID) return buildAddChild(state, id, open$);
    const tool = PROP_TOOLS.find((t) => t.id === openId);
    if (!tool) return null;
    return buildSwatchPopover({
        property: tool.property,
        onSelect: (value) => state.setTokenOverride(id, tool.property, value),
        onClear: () => {
            state.clearTokenOverride(id, tool.property);
            open$.set(null);
        },
    });
}

function buildPopoverHost(state: EditorState, id: string, open$: OpenSignal): Instance {
    const host = div(baseProps([POPOVER_HOST_CLASS]));
    host.trackDispose(
        effect(() => {
            host.setChildren();
            const openId = open$();
            if (openId === null) return;
            const content = buildPopoverContent(openId, state, id, open$);
            if (content !== null) host.addChild(content);
        }),
    );
    return host;
}

export function attachComponentFrame(host: Instance, component: HomepageComponent, state: EditorState): void {
    const id = component.componentId;
    const open$ = signal<string | null>(null);
    const ctx: FrameContext = { state, id, host };
    const frame = div(baseProps([FRAME_CLASS]));
    attachFrameSides(frame, component, ctx, open$);
    frame.addChild(buildPopoverHost(state, id, open$));
    host.addChild(frame);
    host.trackDispose(
        effect(() => {
            const open = state.selectedId$() === id;
            frame.toggleClass(FRAME_OPEN_CLASS, open);
            if (!open) open$.set(null);
        }),
    );
}
