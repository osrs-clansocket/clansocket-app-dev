import { apiRequest } from "../../fetchers/api-fetcher.js";
import type { GuildSettingsRow } from "../types.js";

export function upsertSettings(guildId: string, settings: GuildSettingsRow): Promise<{ ok: boolean } | null> {
    const path = `/api/discord/state/guild-settings/${encodeURIComponent(guildId)}`;
    return apiRequest<{ ok: boolean }>("POST", path, { settings });
}
