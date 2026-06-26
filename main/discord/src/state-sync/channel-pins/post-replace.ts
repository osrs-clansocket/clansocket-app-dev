import { apiRequest } from "../../fetchers/api-fetcher.js";
import { HTTP_METHOD_POST } from "../../core/constants.js";
import type { ChannelPinRow } from "../types.js";

export function replacePins(
    guildId: string,
    channelId: string,
    pins: readonly ChannelPinRow[],
): Promise<{ ok: boolean; count: number } | null> {
    const path = `/api/discord/state/channel-pins/${encodeURIComponent(guildId)}/sync`;
    return apiRequest<{ ok: boolean; count: number }>(HTTP_METHOD_POST, path, { channelId, pins });
}
