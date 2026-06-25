import type { GeneratedKeyframe, GeneratedTrack } from "../../../../types/voxlab/preset-track-types.js";

export function sample(durationMs: number, count: number, fn: (u: number) => number): GeneratedKeyframe[] {
    const out: GeneratedKeyframe[] = [];
    for (let i = 0; i <= count; i++) {
        const u = i / count;
        out.push({ t: u * durationMs, v: fn(u) });
    }
    return out;
}

export function sampleColor(durationMs: number, count: number, fn: (u: number) => string): GeneratedKeyframe[] {
    const out: GeneratedKeyframe[] = [];
    for (let i = 0; i <= count; i++) {
        const u = i / count;
        out.push({ t: u * durationMs, v: fn(u) });
    }
    return out;
}

export function track(property: string, type: GeneratedTrack["type"], keyframes: GeneratedKeyframe[]): GeneratedTrack {
    return { property, type, keyframes };
}
