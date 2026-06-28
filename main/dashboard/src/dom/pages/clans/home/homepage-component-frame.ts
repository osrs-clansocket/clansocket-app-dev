import { div, effect, type Instance, baseProps } from "../../../factory";
import { signal } from "../../../factory/reactive";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import type { EditorState } from "./homepage-editor-state.js";
import { buildSwatchPopover } from "./token-swatch-popover.js";
import { buildOverrideList } from "./homepage-override-list.js";
import { buildImageSourcePopover } from "./homepage-image-source-popover.js";
import { buildAddChild } from "./homepage-add-child.js";
import { buildChartSourcePopover } from "./homepage-chart-source-popover.js";
import { PROP_TOOLS, type FrameContext } from "./homepage-frame-tools.js";
import { attachFrameSides } from "./homepage-frame-sides.js";

const FRAME_CLASS = "clans-home__frame";
const FRAME_OPEN_CLASS = "is-open";
const POPOVER_HOST_CLASS = "clans-home__frame-popover-host";
const ACTIVE_TOOL_SELECTOR = ".clans-home__frame-tool.is-active";
const VIEWPORT_MARGIN = 8;

const POPOVER_OVERRIDES_ID = "info";
const POPOVER_IMAGE_SOURCE_ID = "image-source";
const POPOVER_ADD_CHILD_ID = "add-child";
const POPOVER_CHART_SOURCE_ID = "chart-source";

type OpenSignal = ReturnType<typeof signal<string | null>>;

function buildPopoverContent(openId: string, state: EditorState, id: string, open$: OpenSignal): Instance | null {
    const close = (): void => open$.set(null);
    if (openId === POPOVER_OVERRIDES_ID) return buildOverrideList(state, id, close);
    if (openId === POPOVER_IMAGE_SOURCE_ID) return buildImageSourcePopover(state, id, close);
    if (openId === POPOVER_ADD_CHILD_ID) return buildAddChild(state, id, open$);
    if (openId === POPOVER_CHART_SOURCE_ID) return buildChartSourcePopover(state, id);
    const tool = PROP_TOOLS.find((t) => t.id === openId);
    if (!tool) return null;
    return buildSwatchPopover({
        property: tool.property,
        onSelect: (value) => state.setTokenOverride(id, tool.property, value),
        onClear: () => {
            state.clearTokenOverride(id, tool.property);
            open$.set(null);
        },
        onClose: close,
    });
}

function positionHost(host: HTMLElement, trigger: HTMLElement): void {
    const tr = trigger.getBoundingClientRect();
    const pr = host.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top = tr.bottom + VIEWPORT_MARGIN;
    if (top + pr.height > vh - VIEWPORT_MARGIN) {
        const above = tr.top - pr.height - VIEWPORT_MARGIN;
        if (above >= VIEWPORT_MARGIN) top = above;
        else top = Math.max(VIEWPORT_MARGIN, vh - pr.height - VIEWPORT_MARGIN);
    }
    let left = tr.left + tr.width / 2 - pr.width / 2;
    if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;
    if (left + pr.width > vw - VIEWPORT_MARGIN) left = vw - pr.width - VIEWPORT_MARGIN;
    host.style.left = `${left}px`;
    host.style.top = `${top}px`;
}

function buildPopoverHost(state: EditorState, id: string, open$: OpenSignal, frame: Instance): Instance {
    const host = div(baseProps([POPOVER_HOST_CLASS]));
    let mounted = false;
    const reposition = (): void => {
        if (!mounted) return;
        const trigger = frame.el.querySelector(ACTIVE_TOOL_SELECTOR) as HTMLElement | null;
        positionHost(host.el, trigger ?? frame.el);
    };
    const detach = (): void => {
        if (!mounted) return;
        host.el.remove();
        mounted = false;
        window.removeEventListener("scroll", reposition, true);
        window.removeEventListener("resize", reposition);
    };
    host.trackDispose(
        effect(() => {
            host.setChildren();
            const openId = open$();
            if (openId === null) {
                detach();
                return;
            }
            const content = buildPopoverContent(openId, state, id, open$);
            if (content === null) {
                detach();
                return;
            }
            host.addChild(content);
            if (!mounted) {
                document.body.appendChild(host.el);
                mounted = true;
                window.addEventListener("scroll", reposition, true);
                window.addEventListener("resize", reposition);
            }
            requestAnimationFrame(reposition);
        }),
    );
    host.trackDispose({ dispose: detach });
    return host;
}

export function attachComponentFrame(host: Instance, component: HomepageComponent, state: EditorState): void {
    const id = component.componentId;
    const open$ = signal<string | null>(null);
    const ctx: FrameContext = { state, id, host };
    const frame = div(baseProps([FRAME_CLASS]));
    attachFrameSides(frame, component, ctx, open$);
    frame.addChild(buildPopoverHost(state, id, open$, frame));
    host.addChild(frame);
    host.trackDispose(
        effect(() => {
            const open = state.selectedId$() === id;
            frame.toggleClass(FRAME_OPEN_CLASS, open);
            if (!open) open$.set(null);
        }),
    );
}
