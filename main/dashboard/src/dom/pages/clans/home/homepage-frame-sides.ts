import { div, effect, icon, type Instance, baseProps } from "../../../factory";
import { signal } from "../../../factory/reactive";
import { setDynProps } from "../../../../state/dynamic-styles.js";
import { buildGlassColor } from "../../../forms/glass/inputs/color/index.js";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import { ACTION_TOOLS, PROP_TOOLS, UNPARENT_TOOL, type FrameContext, type PropTool } from "./homepage-frame-tools.js";
import { toolButton } from "./homepage-frame-button.js";

const SIDEBAR_CLASS = "clans-home__frame-side";
const SIDEBAR_TOP = "clans-home__frame-side--top";
const SIDEBAR_RIGHT = "clans-home__frame-side--right";
const SIDEBAR_BOTTOM = "clans-home__frame-side--bottom";
const SIDEBAR_LEFT = "clans-home__frame-side--left";
const HIDDEN_CLASS = "is-hidden";
const ICON_PITCH = 32;

const COLOR_PROP_IDS: ReadonlySet<string> = new Set(["color", "background", "border-color"]);

const IMAGE_SOURCE_TOOL = { id: "image-source", name: "image", label: "Image source" };
const INFO_TOOL = { id: "info", name: "info-circle", label: "Applied overrides" };
const ADD_CHILD_TOOL = { id: "add-child", name: "plus-circle", label: "Add to section" };

type OpenSignal = ReturnType<typeof signal<string | null>>;
type Side = "top" | "right" | "bottom" | "left";

interface SideRefs {
    readonly top: Instance;
    readonly right: Instance;
    readonly bottom: Instance;
    readonly left: Instance;
}

interface Capacity {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

function buildToggleTool(toolId: string, name: string, label: string, open$: OpenSignal): Instance {
    return toolButton({
        name,
        label,
        active$: () => open$() === toolId,
        onClick: () => open$.set(open$() === toolId ? null : toolId),
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

type Kind = HomepageComponent["componentName"];

function defaultColorFor(kind: Kind, prop: string): string {
    if (prop === "--kpi-label-color") return "#6c7480";
    if (prop === "--kpi-value-color") return "#e0c96e";
    if (prop === "--color") return "#e8ecf2";
    if (prop === "--background") {
        if (kind === "kpi") return "#0d0e1066";
        if (kind === "container") return "#0d0e1026";
        return "#00000000";
    }
    if (prop === "--border-color") {
        if (kind === "kpi") return "#c9a84c4d";
        if (kind === "container") return "#353a4340";
        return "#00000000";
    }
    return "#000000";
}

function readCss(host: HTMLElement, selector: string, prop: string): string {
    const el = selector ? (host.querySelector(selector) as HTMLElement | null) ?? host : host;
    return getComputedStyle(el).getPropertyValue(prop).trim();
}

function rgbToHex(rgb: string): string | null {
    if (!rgb.startsWith("rgb")) return null;
    const lp = rgb.indexOf("(");
    const rp = rgb.indexOf(")");
    if (lp < 0 || rp < 0) return null;
    const inner = rgb.slice(lp + 1, rp).split("/").join(",");
    const parts = inner.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    if (parts.length < 3) return null;
    const r = Number.parseInt(parts[0], 10);
    const g = Number.parseInt(parts[1], 10);
    const b = Number.parseInt(parts[2], 10);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    const a = parts.length >= 4 ? Math.round(Number.parseFloat(parts[3]) * 255) : 255;
    const hex2 = (v: number): string => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
    if (a >= 255) return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
    return `#${hex2(r)}${hex2(g)}${hex2(b)}${hex2(a)}`;
}

function sampleSelector(kind: Kind, prop: string): string {
    if (prop === "--kpi-label-color") return ".clans-home__kpi-label";
    if (prop === "--kpi-value-color") return ".clans-home__kpi-value";
    if (prop !== "--color") return "";
    if (kind === "heading" || kind === "paragraph") return ".clans-home__component-text";
    return "";
}

function cssPropertyFor(token: string): string {
    if (token === "--color") return "color";
    if (token === "--background") return "background-color";
    if (token === "--border-color") return "border-color";
    if (token === "--kpi-label-color" || token === "--kpi-value-color") return "color";
    return token;
}

function readCurrentColor(ctx: FrameContext, kind: Kind, prop: string): string {
    const comp = ctx.state.draft$().find((c) => c.componentId === ctx.id);
    const override = comp?.tokenOverrides[prop];
    if (override !== undefined && override !== "") return override;
    const computed = readCss(ctx.host.el, sampleSelector(kind, prop), cssPropertyFor(prop));
    if (computed) {
        const hex = rgbToHex(computed);
        if (hex !== null) return hex;
    }
    return defaultColorFor(kind, prop);
}

function iconNameFor(prop: string): string {
    if (prop === "--color") return "type";
    if (prop === "--background") return "paint-bucket";
    if (prop === "--border-color") return "border";
    if (prop === "--kpi-label-color") return "type-italic";
    if (prop === "--kpi-value-color") return "type-bold";
    return "type";
}

function hexLuminance(hex: string): number {
    if (!hex.startsWith("#") || (hex.length !== 7 && hex.length !== 9)) return 1;
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return 1;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function tintForLuminance(l: number): string {
    return l > 0.5 ? "var(--base-graphite-800)" : "var(--base-graphite-100)";
}

function buildColorTool(ctx: FrameContext, kind: Kind, prop: string): Instance {
    const picker = buildGlassColor({
        name: prop,
        ariaLabel: `Pick ${prop}`,
        value: () => readCurrentColor(ctx, kind, prop),
        onChange: (next) => ctx.state.setTokenOverride(ctx.id, prop, next),
    });
    const badge = div(baseProps(["clans-home__color-tool-icon"]), [
        icon({ name: iconNameFor(prop), context: null, meta: null }).el,
    ]);
    const wrap = div(baseProps(["clans-home__color-tool"]), [picker, badge]);
    wrap.trackDispose(
        effect(() => {
            const hex = readCurrentColor(ctx, kind, prop);
            setDynProps(wrap.el, { "--icon-tint": tintForLuminance(hexLuminance(hex)) });
        }),
    );
    return wrap;
}

function buildPropEntry(tool: PropTool, ctx: FrameContext, kind: Kind, open$: OpenSignal): Instance {
    if (COLOR_PROP_IDS.has(tool.id)) return buildColorTool(ctx, kind, tool.property);
    return buildToggleTool(tool.id, tool.name, tool.label, open$);
}

const KPI_COLOR_SLOTS: ReadonlyArray<{ property: string; label: string }> = [
    { property: "--kpi-label-color", label: "KPI label color" },
    { property: "--kpi-value-color", label: "KPI value color" },
];

function gatherTools(component: HomepageComponent, ctx: FrameContext, open$: OpenSignal): Instance[] {
    const tools: Instance[] = [];
    const kind = component.componentName;
    for (const tool of PROP_TOOLS) {
        if (kind === "kpi" && tool.id === "color") continue;
        tools.push(buildPropEntry(tool, ctx, kind, open$));
    }
    if (kind === "kpi") {
        for (const slot of KPI_COLOR_SLOTS) tools.push(buildColorTool(ctx, kind, slot.property));
    }
    if (component.componentName === "image") {
        tools.push(buildToggleTool(IMAGE_SOURCE_TOOL.id, IMAGE_SOURCE_TOOL.name, IMAGE_SOURCE_TOOL.label, open$));
    }
    if (component.componentName === "container") {
        tools.push(buildToggleTool(ADD_CHILD_TOOL.id, ADD_CHILD_TOOL.name, ADD_CHILD_TOOL.label, open$));
    }
    tools.push(buildToggleTool(INFO_TOOL.id, INFO_TOOL.name, INFO_TOOL.label, open$));
    for (const tool of ACTION_TOOLS) tools.push(buildActionTool(tool, ctx));
    const unparent = buildActionTool(UNPARENT_TOOL, ctx);
    tools.push(unparent);
    ctx.host.trackDispose(
        effect(() => {
            const current = ctx.state.draft$().find((c) => c.componentId === ctx.id);
            unparent.toggleClass(HIDDEN_CLASS, current === undefined || current.parentId === null);
        }),
    );
    return tools;
}

function computeCapacity(rect: DOMRect): Capacity {
    const w = Math.max(0, Math.floor(rect.width / ICON_PITCH));
    const h = Math.max(0, Math.floor(rect.height / ICON_PITCH));
    return { top: w, bottom: w, left: h, right: h };
}

function distribute(tools: ReadonlyArray<Instance>, cap: Capacity): Record<Side, Instance[]> {
    const result: Record<Side, Instance[]> = { top: [], right: [], bottom: [], left: [] };
    const total = cap.top + cap.right + cap.bottom + cap.left;
    const n = tools.length;
    if (total === 0) {
        result.bottom = [...tools];
        return result;
    }
    const order: ReadonlyArray<Side> = ["top", "right", "bottom", "left"];
    let i = 0;
    for (const side of order) {
        const share = Math.floor((n * cap[side]) / total);
        const take = Math.min(share, cap[side], n - i);
        result[side] = tools.slice(i, i + take);
        i += take;
    }
    for (const side of order) {
        if (i >= n) break;
        const room = cap[side] - result[side].length;
        const take = Math.min(room, n - i);
        if (take > 0) {
            result[side] = [...result[side], ...tools.slice(i, i + take)];
            i += take;
        }
    }
    if (i < n) result.bottom = [...result.bottom, ...tools.slice(i)];
    return result;
}

function applyDistribution(sides: SideRefs, dist: Record<Side, Instance[]>): void {
    for (const t of dist.top) sides.top.el.appendChild(t.el);
    for (const t of dist.right) sides.right.el.appendChild(t.el);
    for (const t of dist.bottom) sides.bottom.el.appendChild(t.el);
    for (const t of dist.left) sides.left.el.appendChild(t.el);
}

function makeSides(): SideRefs {
    return {
        top: div(baseProps([SIDEBAR_CLASS, SIDEBAR_TOP])),
        right: div(baseProps([SIDEBAR_CLASS, SIDEBAR_RIGHT])),
        bottom: div(baseProps([SIDEBAR_CLASS, SIDEBAR_BOTTOM])),
        left: div(baseProps([SIDEBAR_CLASS, SIDEBAR_LEFT])),
    };
}

export function attachFrameSides(
    frame: Instance,
    component: HomepageComponent,
    ctx: FrameContext,
    open$: OpenSignal,
): void {
    const sides = makeSides();
    frame.addChild(sides.top);
    frame.addChild(sides.right);
    frame.addChild(sides.bottom);
    frame.addChild(sides.left);
    const tools = gatherTools(component, ctx, open$);
    for (const t of tools) frame.addChild(t);
    const redistribute = (): void => {
        const rect = ctx.host.el.getBoundingClientRect();
        applyDistribution(sides, distribute(tools, computeCapacity(rect)));
    };
    redistribute();
    const ro = new ResizeObserver(() => redistribute());
    ro.observe(ctx.host.el);
    frame.trackDispose({ dispose: () => ro.disconnect() });
}
