import type { DiscordBase } from "../audit-common-types.js";

export interface GuildSetName extends DiscordBase {
    beforeName: string;
    afterName: string;
}
export interface GuildSetIcon extends DiscordBase {
    beforeIconUrl: string | null;
    afterIconUrl: string | null;
}
export interface GuildSetBanner extends DiscordBase {
    beforeBannerUrl: string | null;
    afterBannerUrl: string | null;
}
export interface GuildSetDescription extends DiscordBase {
    beforeDescription: string | null;
    afterDescription: string | null;
}
export interface GuildSysChannel extends DiscordBase {
    beforeChannelId: string | null;
    afterChannelId: string | null;
}
export interface GuildSetAfk extends DiscordBase {
    beforeAfkChannelId: string | null;
    afterAfkChannelId: string | null;
    beforeAfkTimeout: number | null;
    afterAfkTimeout: number | null;
}
export interface GuildWelcomeScreen extends DiscordBase {
    enabled: boolean;
    description?: string | null;
}
export interface GuildVerifyLevel extends DiscordBase {
    beforeLevel: number;
    afterLevel: number;
}
