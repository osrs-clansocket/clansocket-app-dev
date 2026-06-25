import { isObject, type TimelineMigration } from "./timeline-migration-types.js";

export const migrate1to2: TimelineMigration = (raw) => {
    const initial = isObject(raw.initialSnapshot) ? (raw.initialSnapshot as Record<string, unknown>) : {};
    const sec = isObject(initial.sections) ? (initial.sections as Record<string, unknown>) : {};
    const vp = isObject(initial.viewport) ? (initial.viewport as Record<string, unknown>) : {};
    return {
        ...raw,
        schemaVersion: 2,
        initialSnapshot: {
            schemaVersion: 2,
            capturedAt: typeof initial.capturedAt === "number" ? initial.capturedAt : 0,
            parts: {
                effects: sec.effects,
                material: sec.material,
                motion: sec.motion,
                scene: sec.scene,
                display: initial.display,
                viewport: { cameraPosition: vp.cameraPosition, cameraTarget: vp.cameraTarget },
            },
        },
    };
};
