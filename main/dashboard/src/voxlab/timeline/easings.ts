import type { EaseName } from "../../shared/types/voxlab/timeline-types.js";

export type EaseFn = (t: number) => number;

const EASE_FNS: Record<EaseName, EaseFn> = {
    linear: (t) => t,
    easeIn: (t) => t * t,
    easeOut: (t) => 1 - (1 - t) * (1 - t),
    easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) * (-2 * t + 2)) / 2),
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => 1 - (1 - t) * (1 - t) * (1 - t),
    easeCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) * (-2 * t + 2) * (-2 * t + 2)) / 2),
};

export function applyEase(name: EaseName | undefined, t: number): number {
    return (EASE_FNS[name ?? "linear"] ?? EASE_FNS.linear)(t);
}
