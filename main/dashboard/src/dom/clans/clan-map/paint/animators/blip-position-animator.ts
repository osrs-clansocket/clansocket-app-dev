import { blipPositionAt, type BlipAnimState } from "./blip-position-mover.js";
import type { BlipPositionAnimator } from "./blip-anim-type.js";
import { updateAnimations } from "./blip-anim-update.js";

export type { BlipPositionAnimator } from "./blip-anim-type.js";

export function makeAnimator(): BlipPositionAnimator {
    const animations = new Map<string, BlipAnimState>();
    return {
        update: (state, nowMs) => updateAnimations(animations, state, nowMs),
        getInterpolated: (accountHash, nowMs) => {
            const anim = animations.get(accountHash);
            return anim === undefined ? null : blipPositionAt(anim, nowMs);
        },
        hasActive: (nowMs) => {
            for (const anim of animations.values()) {
                if (anim.durationMs > 0 && nowMs - anim.startMs < anim.durationMs) return true;
            }
            return false;
        },
    };
}
