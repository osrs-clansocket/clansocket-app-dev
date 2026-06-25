import type { Instance } from "../../../../factory";
import type { DiscordServer } from "../../../../../state/discord/client.js";

export interface ModeContext {
    slug: string;
    server: DiscordServer;
    servers: readonly DiscordServer[];
}

export interface DiscordModeDef {
    key: string;
    label: string;
    build: (ctx: ModeContext) => Instance;
    order?: number;
    placeholder?: boolean;
}

const defs: DiscordModeDef[] = [];

export function defineDiscordMode(def: DiscordModeDef): void {
    defs.push(def);
}

export function discordModeDefs(): readonly DiscordModeDef[] {
    return [...defs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
