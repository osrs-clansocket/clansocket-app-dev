import type { BlipAnimState } from "./blip-state-types.js";

export function blipPositionAt(anim: BlipAnimState, nowMs: number): { x: number; y: number } {
    if (anim.durationMs <= 0) return { x: anim.toX, y: anim.toY };
    const elapsed = nowMs - anim.startMs;
    const t = Math.min(1, Math.max(0, elapsed / anim.durationMs));
    return {
        x: anim.fromX + (anim.toX - anim.fromX) * t,
        y: anim.fromY + (anim.toY - anim.fromY) * t,
    };
}
