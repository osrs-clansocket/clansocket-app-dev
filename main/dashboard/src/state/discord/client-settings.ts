import { jsonFetch } from "../../shared/fetchers/json-fetcher.js";
import type { WelcomeScreenChannel } from "./client-types-content.js";

export interface SetGuildName {
    userId: string;
    beforeName: string;
    name: string;
}
export interface SetGuildIcon {
    userId: string;
    guildName: string;
    beforeIconUrl: string | null;
    iconDataUrl: string | null;
    afterIconUrl: string | null;
}
export interface SetGuildBanner {
    userId: string;
    guildName: string;
    beforeBannerUrl: string | null;
    bannerDataUrl: string | null;
    afterBannerUrl: string | null;
}
export interface SetGuildDescription {
    userId: string;
    guildName: string;
    beforeDescription: string | null;
    description: string | null;
}
export interface SetSystemChannel {
    userId: string;
    guildName: string;
    beforeChannelId: string | null;
    channelId: string | null;
}
export interface SetGuildAfk {
    userId: string;
    guildName: string;
    beforeAfkChannelId: string | null;
    afkChannelId: string | null;
    beforeAfkTimeout: number | null;
    afkTimeout: number | null;
}
export interface SetVerificationLevel {
    userId: string;
    guildName: string;
    beforeLevel: number;
    level: number;
}
export interface SetWelcomeScreen {
    userId: string;
    guildName: string;
    enabled: boolean;
    description?: string | null;
    welcomeChannels?: WelcomeScreenChannel[];
}

const base = (gid: string, path: string): string => `/api/discord/guild-settings/${encodeURIComponent(gid)}/${path}`;

export async function setGuildName(guildId: string, payload: SetGuildName): Promise<boolean> {
    return (await jsonFetch(base(guildId, "name"), "PATCH", payload)).ok;
}
export async function setGuildIcon(guildId: string, payload: SetGuildIcon): Promise<boolean> {
    return (await jsonFetch(base(guildId, "icon"), "PATCH", payload)).ok;
}
export async function setGuildBanner(guildId: string, payload: SetGuildBanner): Promise<boolean> {
    return (await jsonFetch(base(guildId, "banner"), "PATCH", payload)).ok;
}
export async function setGuildDescription(guildId: string, payload: SetGuildDescription): Promise<boolean> {
    return (await jsonFetch(base(guildId, "description"), "PATCH", payload)).ok;
}
export async function setSystemChannel(guildId: string, payload: SetSystemChannel): Promise<boolean> {
    return (await jsonFetch(base(guildId, "system-channel"), "PATCH", payload)).ok;
}
export async function setGuildAfk(guildId: string, payload: SetGuildAfk): Promise<boolean> {
    return (await jsonFetch(base(guildId, "afk"), "PATCH", payload)).ok;
}
export async function setVerificationLevel(guildId: string, payload: SetVerificationLevel): Promise<boolean> {
    return (await jsonFetch(base(guildId, "verification-level"), "PATCH", payload)).ok;
}
export async function setWelcomeScreen(guildId: string, payload: SetWelcomeScreen): Promise<boolean> {
    return (await jsonFetch(base(guildId, "welcome-screen"), "PATCH", payload)).ok;
}

export interface SetChannelPermissions {
    userId: string;
    channelName: string;
    overwriteKind: "role" | "member";
    overwriteTargetId: string;
    overwriteTargetName: string;
    allow: string;
    deny: string;
}

export interface DeleteChannelPermissions {
    userId: string;
    targetName: string;
    overwriteKind: "role" | "member";
    overwriteTargetId: string;
    overwriteTargetName: string;
}

export async function setChannelPermissions(
    guildId: string,
    channelId: string,
    payload: SetChannelPermissions,
): Promise<boolean> {
    const res = await jsonFetch(
        `/api/discord/channels/${encodeURIComponent(guildId)}/${encodeURIComponent(channelId)}/permissions`,
        "POST",
        payload,
    );
    return res.ok;
}

export async function deleteChannelPermissions(
    guildId: string,
    channelId: string,
    overwriteTargetId: string,
    payload: DeleteChannelPermissions,
): Promise<boolean> {
    const res = await jsonFetch(
        `/api/discord/channels/${encodeURIComponent(guildId)}/${encodeURIComponent(channelId)}/permissions/${encodeURIComponent(overwriteTargetId)}`,
        "DELETE",
        payload,
    );
    return res.ok;
}
