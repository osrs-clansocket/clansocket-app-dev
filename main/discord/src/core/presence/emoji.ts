import type { PresenceTemplate } from "../../shared/types/presence-types.js";

const ANIMATED_TRUE = 1;

export function buildActivityEmoji(t: PresenceTemplate): Record<string, unknown> | null {
    if (!t.activity_emoji_id && !t.activity_emoji_name) return null;
    const emoji: Record<string, unknown> = {};
    if (t.activity_emoji_id) emoji.id = t.activity_emoji_id;
    if (t.activity_emoji_name) emoji.name = t.activity_emoji_name;
    if (t.activity_emoji_animated === ANIMATED_TRUE) emoji.animated = true;
    return emoji;
}
