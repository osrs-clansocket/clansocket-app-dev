import type { SceneSnapshot } from "../../../../types/voxlab/snapshot-types.js";

export function readNumber(snap: SceneSnapshot, part: string, key: string, fallback: number): number {
    const p = snap.parts[part];
    if (p && typeof p === "object" && key in (p as Record<string, unknown>)) {
        const v = (p as Record<string, unknown>)[key];
        if (typeof v === "number" && Number.isFinite(v)) return v;
    }
    return fallback;
}

export function readString(snap: SceneSnapshot, part: string, key: string, fallback: string): string {
    const p = snap.parts[part];
    if (p && typeof p === "object" && key in (p as Record<string, unknown>)) {
        const v = (p as Record<string, unknown>)[key];
        if (typeof v === "string") return v;
    }
    return fallback;
}
