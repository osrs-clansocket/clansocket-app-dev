import type { EditorState } from "./homepage-editor-state.js";

export interface TooltipDef {
    title: string;
    description: string;
    affects?: string;
    allowed?: string;
    valueBuilder?: (ctx: { state: EditorState; id: string }) => () => string;
}

const propOverride = (prop: string) => ({ state, id }: { state: EditorState; id: string }) => (): string => {
    const v = state.draft$().find((c) => c.componentId === id)?.tokenOverrides[prop];
    return v !== undefined && v !== "" ? v : "(default)";
};

export const TOOL_TOOLTIPS: Record<string, TooltipDef> = {
    "add-heading": {
        title: "Add heading",
        description: "Insert a new heading component on the canvas.",
        affects: "Component list",
    },
    "add-paragraph": {
        title: "Add paragraph",
        description: "Insert a new paragraph component.",
        affects: "Component list",
    },
    "add-image": {
        title: "Add image",
        description: "Upload an image file and place it as a new image component.",
        affects: "Component list",
    },
    "add-container": {
        title: "Add container",
        description: "Insert a sectioning container that can group other components as its children.",
        affects: "Component list",
    },
    "add-spacer": {
        title: "Add spacer",
        description: "Insert an invisible spacer for layout breathing room.",
        affects: "Component list",
    },
    "add-kpi": {
        title: "Add KPI",
        description: "Insert a label + value tile, useful for stats.",
        affects: "Component list",
    },
    "toggle-variables": {
        title: "Variables row",
        description: "Toggle the variables strip — insert {{clan.X}} tokens (name, slug, status, memberCount, etc.) into selected text.",
        affects: "Editor chrome",
    },
    "toggle-guides": {
        title: "Guides + rulers",
        description: "Toggle photoshop-style guides and rulers. Drag from a ruler to add a guide; components snap to nearby guides while dragging.",
        affects: "Editor chrome + snapping",
    },
    "undo": {
        title: "Undo",
        description: "Revert the last edit. History keeps up to 50 steps.",
        affects: "Draft state",
    },
    "redo": {
        title: "Redo",
        description: "Re-apply the last undone edit.",
        affects: "Draft state",
    },
    "clear-all": {
        title: "Clear all",
        description: "Remove every component from the draft.",
        affects: "Draft state",
    },
    "save": {
        title: "Save homepage",
        description: "Persist the current draft to the server.",
        affects: "Saved state",
    },
    "exit-edit": {
        title: "Exit edit mode",
        description: "Leave edit mode without saving. Unsaved changes are discarded.",
        affects: "Editor mode",
    },
    "add-bottom-section": {
        title: "Add section below",
        description: "Append a full-width container below the current content.",
        affects: "Component list",
    },
    "color": {
        title: "Text color",
        description: "Foreground color of text rendered inside this component.",
        affects: "CSS --color",
        allowed: "Any color (hex with alpha)",
        valueBuilder: propOverride("--color"),
    },
    "background": {
        title: "Background",
        description: "Fill color of the component's background area.",
        affects: "CSS --background",
        allowed: "Any color (hex with alpha)",
        valueBuilder: propOverride("--background"),
    },
    "padding": {
        title: "Padding",
        description: "Inner spacing between the component's edge and its content.",
        affects: "CSS --padding",
        allowed: "Spacing token (--sp-0 to --sp-8)",
        valueBuilder: propOverride("--padding"),
    },
    "margin": {
        title: "Margin",
        description: "Outer spacing around the component.",
        affects: "CSS --margin",
        allowed: "Spacing token (--sp-0 to --sp-8)",
        valueBuilder: propOverride("--margin"),
    },
    "border-radius": {
        title: "Corner radius",
        description: "Rounding of the component's corners.",
        affects: "CSS --border-radius",
        allowed: "--radius-md / --radius-pill / --radius-full / 0",
        valueBuilder: propOverride("--border-radius"),
    },
    "border-color": {
        title: "Border color",
        description: "Color of the component's outline border.",
        affects: "CSS --border-color",
        allowed: "Any color (hex with alpha)",
        valueBuilder: propOverride("--border-color"),
    },
    "font-size": {
        title: "Font size",
        description: "Size of text in this component.",
        affects: "CSS --font-size",
        allowed: "--fs-3xs to --fs-2xl",
        valueBuilder: propOverride("--font-size"),
    },
    "font-weight": {
        title: "Font weight",
        description: "Thickness of text strokes.",
        affects: "CSS --font-weight",
        allowed: "--fw-thin / light / medium / semi / bold",
        valueBuilder: propOverride("--font-weight"),
    },
    "font-family": {
        title: "Font family",
        description: "Typeface used by the component's text.",
        affects: "CSS --font-family",
        allowed: "--font-heading / body / mono",
        valueBuilder: propOverride("--font-family"),
    },
    "text-align": {
        title: "Text alignment",
        description: "Horizontal alignment of text.",
        affects: "CSS --text-align",
        allowed: "start / center / end",
        valueBuilder: propOverride("--text-align"),
    },
    "letter-spacing": {
        title: "Letter spacing",
        description: "Horizontal space between glyphs.",
        affects: "CSS --letter-spacing",
        allowed: "--ls-tight / normal / wide",
        valueBuilder: propOverride("--letter-spacing"),
    },
    "line-height": {
        title: "Line height",
        description: "Vertical space between lines of wrapped text.",
        affects: "CSS --line-height",
        allowed: "--lh-flat / snug / normal / loose",
        valueBuilder: propOverride("--line-height"),
    },
    "opacity": {
        title: "Opacity",
        description: "Translucency of the entire component, content included.",
        affects: "CSS --opacity",
        allowed: "--opacity-faint / medium / solid / 1",
        valueBuilder: propOverride("--opacity"),
    },
    "shadow": {
        title: "Shadow",
        description: "Drop shadow applied to the component box.",
        affects: "CSS --shadow",
        allowed: "--shadow-glow / card / none",
        valueBuilder: propOverride("--shadow"),
    },
    "backdrop-filter": {
        title: "Backdrop blur",
        description: "Frosted-glass blur applied behind the component.",
        affects: "CSS --backdrop-filter",
        allowed: "blur(--blur-sm / md / lg) / none",
        valueBuilder: propOverride("--backdrop-filter"),
    },
    "fit": { title: "Fit to content", description: "Resize this component to wrap its content tightly." },
    "duplicate": { title: "Duplicate", description: "Make a copy of the selected component, offset slightly." },
    "z-up": { title: "Bring forward", description: "Raise this component one layer above its siblings." },
    "z-down": { title: "Send backward", description: "Lower this component one layer below its siblings." },
    "delete": { title: "Delete", description: "Permanently remove this component from the draft." },
    "image-source": {
        title: "Image source",
        description: "Pick which image to render — uploaded file, clan icon, or upload a new one.",
        affects: "Component payload",
    },
    "add-child": {
        title: "Add to section",
        description: "Add a new component as a child of this container.",
        affects: "Component list",
    },
    "info": {
        title: "Applied overrides",
        description: "Lists every token override currently applied to this component.",
    },
    "unparent": {
        title: "Remove from section",
        description: "Detach this component from its parent container — back to top-level.",
        affects: "Component parentId",
    },
    "kpi-label-color": {
        title: "KPI label color",
        description: "Color of the small label text above the KPI value.",
        affects: "CSS --kpi-label-color",
        allowed: "Any color (hex with alpha)",
        valueBuilder: propOverride("--kpi-label-color"),
    },
    "kpi-value-color": {
        title: "KPI value color",
        description: "Color of the large value text.",
        affects: "CSS --kpi-value-color",
        allowed: "Any color (hex with alpha)",
        valueBuilder: propOverride("--kpi-value-color"),
    },
};
