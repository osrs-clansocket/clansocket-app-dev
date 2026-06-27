import { div, effect, type Instance, baseProps } from "../../../factory";
import { signal } from "../../../factory/reactive";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import type { EditorState } from "./homepage-editor-state.js";
import { buildSwatchPopover } from "./token-swatch-popover.js";
import { buildOverrideList } from "./homepage-override-list.js";
import { buildImageSourcePopover } from "./homepage-image-source-popover.js";
import { buildAddChild } from "./homepage-add-child.js";
import { ACTION_TOOLS, PROP_TOOLS, UNPARENT_TOOL, type FrameContext } from "./homepage-frame-tools.js";
import { toolButton } from "./homepage-frame-button.js";

const FRAME_CLASS = "clans-home__frame";
const FRAME_OPEN_CLASS = "is-open";
const TOOLBAR_CLASS = "clans-home__frame-toolbar";
const POPOVER_HOST_CLASS = "clans-home__frame-popover-host";

const POPOVER_OVERRIDES_ID = "info";
const POPOVER_IMAGE_SOURCE_ID = "image-source";
const POPOVER_ADD_CHILD_ID = "add-child";

const IMAGE_SOURCE_TOOL = { id: "image-source", name: "image", label: "Image source" };
const INFO_TOOL = { id: "info", name: "info-circle", label: "Applied overrides" };
const ADD_CHILD_TOOL = { id: "add-child", name: "plus-circle", label: "Add to section" };

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

function buildActionTool(tool: (typeof ACTION_TOOLS)[number], ctx: FrameContext): Instance {
    return toolButton({
        name: tool.name,
        label: tool.label,
        active$: () => false,
        onClick: () => tool.run(ctx),
    });
}

function buildPopoverContent(
    openId: string,
    state: EditorState,
    id: string,
    openProp$: ReturnType<typeof signal<string | null>>,
): Instance | null {
    if (openId === POPOVER_OVERRIDES_ID) return buildOverrideList(state, id);
    if (openId === POPOVER_IMAGE_SOURCE_ID) return buildImageSourcePopover(state, id);
    if (openId === POPOVER_ADD_CHILD_ID) return buildAddChild(state, id, openProp$);
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

function buildToolbar(
    component: HomepageComponent,
    ctx: FrameContext,
    openProp$: ReturnType<typeof signal<string | null>>,
): Instance {
    const toolbar = div(baseProps([TOOLBAR_CLASS]));
    for (const tool of PROP_TOOLS) toolbar.addChild(buildToggleTool(tool.id, tool.name, tool.label, openProp$));
    if (component.componentName === "image") {
        toolbar.addChild(buildToggleTool(IMAGE_SOURCE_TOOL.id, IMAGE_SOURCE_TOOL.name, IMAGE_SOURCE_TOOL.label, openProp$));
    }
    if (component.componentName === "container") {
        toolbar.addChild(buildToggleTool(ADD_CHILD_TOOL.id, ADD_CHILD_TOOL.name, ADD_CHILD_TOOL.label, openProp$));
    }
    toolbar.addChild(buildToggleTool(INFO_TOOL.id, INFO_TOOL.name, INFO_TOOL.label, openProp$));
    for (const tool of ACTION_TOOLS) toolbar.addChild(buildActionTool(tool, ctx));
    const unparentBtn = buildActionTool(UNPARENT_TOOL, ctx);
    toolbar.addChild(unparentBtn);
    toolbar.trackDispose(
        effect(() => {
            const current = ctx.state.draft$().find((c) => c.componentId === ctx.id);
            unparentBtn.toggleClass("is-hidden", current === undefined || current.parentId === null);
        }),
    );
    return toolbar;
}

export function attachComponentFrame(host: Instance, component: HomepageComponent, state: EditorState): void {
    const id = component.componentId;
    const openProp$ = signal<string | null>(null);
    const ctx: FrameContext = { state, id, host };
    const toolbar = buildToolbar(component, ctx, openProp$);
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
