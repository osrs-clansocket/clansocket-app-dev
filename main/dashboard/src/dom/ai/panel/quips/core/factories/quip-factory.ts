import type { Mood, Quip } from "../quip-types.js";

export function q(mood: Mood, text: string): Quip {
    return { text, mood };
}
