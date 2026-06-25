import { isObject } from "../is-object.js";

function splitDisplay(parts: Record<string, unknown>, d: Record<string, unknown>): void {
    if (parts.wireframe === undefined) {
        parts.wireframe = {
            enabled: !!d.wireframe,
            color: typeof d.wireframeColor === "string" ? d.wireframeColor : "#f5ca7a",
            opacity: typeof d.wireframeOpacity === "number" ? d.wireframeOpacity : 0.35,
        };
    }
    if (parts.shading === undefined) parts.shading = { smoothShading: !!d.smoothShading };
    if (parts.shadows === undefined) parts.shadows = { enabled: !!d.castShadows };
    if (isObject(parts.gridAxes)) {
        const g = { ...(parts.gridAxes as Record<string, unknown>) };
        if (g.gridEnabled === undefined && typeof d.showGrid === "boolean") g.gridEnabled = d.showGrid;
        parts.gridAxes = g;
    }
}

export function migrate9to10(raw: Record<string, unknown>): Record<string, unknown> {
    const parts = isObject(raw.parts) ? { ...(raw.parts as Record<string, unknown>) } : {};
    if (isObject(parts.display)) {
        splitDisplay(parts, parts.display as Record<string, unknown>);
        delete parts.display;
    }
    return { ...raw, schemaVersion: 10, parts };
}
