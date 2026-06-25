import { apiGetField } from "../fetchers/api-get-field.js";
import type { RoutedServer } from "../shared/types/server-types.js";

export function resolveServer(guildId: string): Promise<RoutedServer | null> {
    return apiGetField<RoutedServer>(`/api/discord/servers/${guildId}`, "server");
}
