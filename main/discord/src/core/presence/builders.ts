import type { PresenceTemplate } from "../../shared/types/presence-types.js";
import { buildActivityAssets } from "./assets.js";
import { buildActivityButtons } from "./buttons.js";
import { buildActivityEmoji } from "./emoji.js";
import { buildActivityTimestamps } from "./timestamps.js";

export function buildActivity(t: PresenceTemplate): Record<string, unknown> {
    const activity: Record<string, unknown> = { name: t.activity_name, type: t.activity_type };
    if (t.activity_url) activity.url = t.activity_url;
    if (t.activity_state) activity.state = t.activity_state;
    if (t.activity_details) activity.details = t.activity_details;
    const emoji = buildActivityEmoji(t);
    if (emoji) activity.emoji = emoji;
    const assets = buildActivityAssets(t);
    if (assets) activity.assets = assets;
    const timestamps = buildActivityTimestamps(t);
    if (timestamps) activity.timestamps = timestamps;
    const buttons = buildActivityButtons(t);
    if (buttons) activity.buttons = buttons;
    return activity;
}
