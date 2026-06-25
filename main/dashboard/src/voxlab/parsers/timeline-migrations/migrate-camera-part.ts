import { isObject } from "./timeline-migration-types.js";

export function migrateCameraPart(parts: Record<string, unknown>): void {
    const vp = isObject(parts.viewport) ? (parts.viewport as Record<string, unknown>) : null;
    const pos = vp && Array.isArray(vp.cameraPosition) ? vp.cameraPosition : [1.3, 0.9, 1.6];
    const tgt = vp && Array.isArray(vp.cameraTarget) ? vp.cameraTarget : [0, 0, 0];
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
}
