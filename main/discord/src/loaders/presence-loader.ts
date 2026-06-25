import { apiGetField } from "../fetchers/api-get-field.js";
import type { PresenceTemplate } from "../shared/types/presence-types.js";

export function loadPresence(botId: string): Promise<PresenceTemplate | null> {
    return apiGetField<PresenceTemplate>(`/api/discord/presence/${botId}`, "template");
}
