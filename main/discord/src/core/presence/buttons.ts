import type { PresenceButton, PresenceTemplate } from "../../shared/types/presence-types.js";

export function buildActivityButtons(t: PresenceTemplate): PresenceButton[] | null {
    if (!t.activity_buttons_json) return null;
    try {
        const parsed = JSON.parse(t.activity_buttons_json) as PresenceButton[];
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
    } catch {
        return null;
    }
}
