import { isObject } from "../is-object.js";

export { migrate3to4 } from "./snapshot-migrate-3to4.js";

export function migrate2to3(raw: Record<string, unknown>): Record<string, unknown> {
    const parts = isObject(raw.parts) ? { ...(raw.parts as Record<string, unknown>) } : {};
    const viewport = isObject(parts.viewport) ? (parts.viewport as Record<string, unknown>) : null;
    const pos = viewport && Array.isArray(viewport.cameraPosition) ? viewport.cameraPosition : [1.3, 0.9, 1.6];
    const tgt = viewport && Array.isArray(viewport.cameraTarget) ? viewport.cameraTarget : [0, 0, 0];
    parts.camera = {
        fov: 45,
        positionX: pos[0],
        positionY: pos[1],
        positionZ: pos[2],
        targetX: tgt[0],
        targetY: tgt[1],
        targetZ: tgt[2],
    };
    delete parts.viewport;
    return { ...raw, schemaVersion: 3, parts };
}

export function migrate1to2(raw: Record<string, unknown>): Record<string, unknown> {
    const sections = isObject(raw.sections) ? (raw.sections as Record<string, unknown>) : {};
    const viewport = isObject(raw.viewport) ? (raw.viewport as Record<string, unknown>) : {};
    const display = isObject(raw.display) ? raw.display : {};
    return {
        schemaVersion: 2,
        capturedAt: typeof raw.capturedAt === "number" ? raw.capturedAt : Date.now(),
        parts: {
            display,
            effects: sections.effects,
            material: sections.material,
            motion: sections.motion,
            scene: sections.scene,
            viewport: {
                cameraPosition: viewport.cameraPosition,
                cameraTarget: viewport.cameraTarget,
            },
        },
    };
}
