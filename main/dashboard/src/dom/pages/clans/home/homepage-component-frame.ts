import { div, effect, type Instance, baseProps } from "../../../factory";
import { signal } from "../../../factory/reactive";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import type { EditorState } from "./homepage-editor-state.js";
import { buildSwatchPopover } from "./token-swatch-popover.js";
import { buildOverrideList } from "./homepage-override-list.js";
import { buildImageSourcePopover } from "./homepage-image-source-popover.js";
import { ACTION_TOOLS, PROP_TOOLS, type FrameContext } from "./homepage-frame-tools.js";
import { toolButton } from "./homepage-frame-button.js";

const FRAME_CLASS = "clans-home__frame";
const FRAME_OPEN_CLASS = "is-open";
const TOOLBAR_CLASS = "clans-home__frame-toolbar";
const POPOVER_HOST_CLASS = "clans-home__frame-popover-host";

function buildToggleTool(
    toolId: string,
    name: string,
    label: string,
    openProp$: ReturnType<typeof signal<string | null>>,
): Instance {
    return toolButton({
        name,
        label,
        active$: () => openProp$() === toolId,
        onClick: () => openProp$.set(openProp$() === toolId ? null : toolId),
    });
}

function buildActionTool(
    tool: (typeof ACTION_TOOLS)[number],
    ctx: FrameContext,
): Instance {
    return toolButton({
        name: tool.name,
        label: tool.label,
        active$: () => false,
        onClick: () => tool.run(ctx),
    });
}

const POPOVER_OVERRIDES_ID = "info";
const POPOVER_IMAGE_SOURCE_ID = "image-source";

function isOverridesPopover(openId: string): boolean {
    return openId === POPOVER_OVERRIDES_ID;
}

function isImageSourcePopover(openId: string): boolean {
    return openId === POPOVER_IMAGE_SOURCE_ID;
}

function buildPopoverContent(
    openId: string,
    state: EditorState,
    id: string,
    openProp$: ReturnType<typeof signal<string | null>>,
): Instance | null {
    if (isOverridesPopover(openId)) return buildOverrideList(state, id);
    if (isImageSourcePopover(openId)) return buildImageSourcePopover(state, id);
    const tool = PROP_TOOLS.find((t) => t.id === openId);
    if (!tool) return null;
    return buildSwatchPopover({
        property: tool.property,
        onSelect: (value) => state.setTokenOverride(id, tool.property, value),
        onClear: () => {
            state.clearTokenOverride(id, tool.property);
            openProp$.set(null);
        },
    });
}

function buildPopoverHost(
    state: EditorState,
    id: string,
    openProp$: ReturnType<typeof signal<string | null>>,
): Instance {
    const host = div(baseProps([POPOVER_HOST_CLASS]));
    host.trackDispose(
        effect(() => {
            host.setChildren();
            const open = openProp$();
            if (open === null) return;
            const content = buildPopoverContent(open, state, id, openProp$);
            if (content !== null) host.addChild(content);
        }),
    );
    return host;
}

const IMAGE_SOURCE_TOOL = { id: "image-source", name: "image", label: "Image source" };
const INFO_TOOL = { id: "info", name: "info-circle", label: "Applied overrides" };

export function attachComponentFrame(host: Instance, component: HomepageComponent, state: EditorState): void {
    const id = component.componentId;
    const openProp$ = signal<string | null>(null);
    const toolbar = div(baseProps([TOOLBAR_CLASS]));
    for (const tool of PROP_TOOLS) toolbar.addChild(buildToggleTool(tool.id, tool.name, tool.label, openProp$));
    if (component.componentName === "image") {
        toolbar.addChild(buildToggleTool(IMAGE_SOURCE_TOOL.id, IMAGE_SOURCE_TOOL.name, IMAGE_SOURCE_TOOL.label, openProp$));
    }
    toolbar.addChild(buildToggleTool(INFO_TOOL.id, INFO_TOOL.name, INFO_TOOL.label, openProp$));
    const ctx: FrameContext = { state, id, host };
    for (const tool of ACTION_TOOLS) toolbar.addChild(buildActionTool(tool, ctx));
    const popoverHost = buildPopoverHost(state, id, openProp$);
    const frame = div(baseProps([FRAME_CLASS]), [toolbar, popoverHost]);
    host.addChild(frame);
    host.trackDispose(
        effect(() => {
            const open = state.selectedId$() === id;
            frame.toggleClass(FRAME_OPEN_CLASS, open);
            if (!open) openProp$.set(null);
        }),
    );
}
