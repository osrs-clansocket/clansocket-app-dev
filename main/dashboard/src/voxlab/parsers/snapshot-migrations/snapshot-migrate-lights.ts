import { isObject } from "../is-object.js";

export function migrate4to5(raw: Record<string, unknown>): Record<string, unknown> {
    const parts = isObject(raw.parts) ? { ...(raw.parts as Record<string, unknown>) } : {};
    if (parts.environment === undefined) {
        parts.environment = { enabled: true, intensity: 1, hdrName: null };
    }
    if (parts.hemisphere === undefined) {
        parts.hemisphere = { skyColor: "#d8e6f2", groundColor: "#3a2d1a", intensity: 0.5 };
    }
    if (parts.rimLight === undefined) {
        parts.rimLight = { intensity: 0.8, color: "#ffffff", positionX: -2, positionY: 1.5, positionZ: -3 };
    }
    if (parts.topLight === undefined) {
        parts.topLight = { intensity: 0.6, color: "#ffffff" };
    }
    if (parts.bottomLight === undefined) {
        parts.bottomLight = { intensity: 0.2, color: "#f5ca7a" };
    }
    return { ...raw, schemaVersion: 5, parts };
}
