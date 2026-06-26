import type { DiscordServer } from "../../../../../state/discord/client.js";

export interface ModeContext {
    slug: string;
    server: DiscordServer;
    servers: readonly DiscordServer[];
}
