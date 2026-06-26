import { div, span, type Instance, textProps } from "../../../../../../factory";
import { SWATCH_CLASS, SWATCH_LABEL_CLASS, type DragKind } from "./mode-constants.js";
import { clearDragSource, setDragSource } from "./mode-drag-state.js";

export function buildSwatch(kind: DragKind, id: string, label: string): Instance {
    const swatch = div({ classes: [SWATCH_CLASS], title: `${kind}: ${label}`, context: null, meta: null }, [
        span(textProps([SWATCH_LABEL_CLASS], label)),
    ]);
    swatch.setAttr("draggable", "true");
    swatch.el.addEventListener("dragstart", (e) => {
        setDragSource(kind, id);
        if (e.dataTransfer === null) return;
        e.dataTransfer.setData("text/plain", `${kind}:${id}`);
        e.dataTransfer.effectAllowed = "copy";
    });
    swatch.el.addEventListener("dragend", () => clearDragSource());
    return swatch;
}
