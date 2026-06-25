import type { PresenceTemplate } from "../../shared/types/presence-types.js";

export function buildActivityAssets(t: PresenceTemplate): Record<string, unknown> | null {
    if (!t.activity_large_image && !t.activity_small_image && !t.activity_large_text && !t.activity_small_text) {
        return null;
    }
    const assets: Record<string, unknown> = {};
    if (t.activity_large_image) assets.large_image = t.activity_large_image;
    if (t.activity_large_text) assets.large_text = t.activity_large_text;
    if (t.activity_small_image) assets.small_image = t.activity_small_image;
    if (t.activity_small_text) assets.small_text = t.activity_small_text;
    return assets;
}
