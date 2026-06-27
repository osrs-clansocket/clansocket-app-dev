import type { Instance } from "../../../factory";
import type { EditorState } from "./homepage-editor-state.js";
import { fitToContent } from "./homepage-resize.js";

export interface PropTool {
    readonly id: string;
    readonly property: string;
    readonly name: string;
    readonly label: string;
}

export const PROP_TOOLS: ReadonlyArray<PropTool> = [
    { id: "color", property: "--color", name: "palette-fill", label: "Text color" },
    { id: "background", property: "--background", name: "paint-bucket", label: "Background" },
    { id: "padding", property: "--padding", name: "arrows-collapse", label: "Padding" },
    { id: "margin", property: "--margin", name: "arrows-expand", label: "Margin" },
    { id: "border-radius", property: "--border-radius", name: "bounding-box-circles", label: "Corner radius" },
    { id: "border-color", property: "--border-color", name: "border", label: "Border color" },
    { id: "font-size", property: "--font-size", name: "type", label: "Font size" },
    { id: "font-weight", property: "--font-weight", name: "type-bold", label: "Font weight" },
    { id: "font-family", property: "--font-family", name: "fonts", label: "Font family" },
    { id: "text-align", property: "--text-align", name: "text-left", label: "Text alignment" },
    { id: "letter-spacing", property: "--letter-spacing", name: "type-italic", label: "Letter spacing" },
    { id: "line-height", property: "--line-height", name: "text-paragraph", label: "Line height" },
    { id: "opacity", property: "--opacity", name: "circle-half", label: "Opacity" },
    { id: "shadow", property: "--shadow", name: "box-arrow-down", label: "Shadow" },
    { id: "backdrop-filter", property: "--backdrop-filter", name: "droplet", label: "Backdrop blur" },
];

export interface FrameContext {
    state: EditorState;
    id: string;
    host: Instance;
}

export interface ActionTool {
    readonly id: string;
    readonly name: string;
    readonly label: string;
    run(ctx: FrameContext): void;
}

export const ACTION_TOOLS: ReadonlyArray<ActionTool> = [
    { id: "fit", name: "arrows-angle-contract", label: "Fit to content", run: ({ host, id, state }) => fitToContent(host, id, state) },
    { id: "duplicate", name: "copy", label: "Duplicate", run: ({ state }) => state.duplicateSelected() },
    { id: "z-up", name: "chevron-double-up", label: "Bring forward", run: ({ state, id }) => state.bringForward(id) },
    { id: "z-down", name: "chevron-double-down", label: "Send backward", run: ({ state, id }) => state.sendBackward(id) },
    { id: "delete", name: "trash", label: "Delete", run: ({ state }) => state.deleteSelected() },
];
