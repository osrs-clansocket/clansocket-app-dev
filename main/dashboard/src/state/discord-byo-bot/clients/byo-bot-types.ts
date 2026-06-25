export type VerifyStatus = "ok" | "auth-failed" | "unknown" | "expired";

export interface PublicMetadata {
    username: string;
    application_id: string;
}

export interface ServedGuild {
    guild_id: string;
    guild_name: string;
}

export interface LinkedStatus {
    linked: true;
    bot_id: string;
    username: string;
    application_id: string;
    last_verified_at: number | null;
    last_verified_status: VerifyStatus;
    owner_site_account_id: string;
    owner_display_name: string;
    clan_owner_site_account_id: string | null;
    served_guilds: ServedGuild[];
}

export interface UnlinkedStatus {
    linked: false;
}

export type ByoBotStatus = LinkedStatus | UnlinkedStatus;

export interface VerifyPayload {
    applicationId: string;
    botToken: string;
    publicKey?: string;
}

export interface VerifyResult {
    ok: boolean;
    publicMetadata?: PublicMetadata;
    reason?: string;
}

export interface LinkResult {
    ok: boolean;
    linked?: {
        bot_id: string;
        username: string;
        application_id: string;
    };
    reason?: string;
}

export interface ReassignLinkerPayload {
    newLinkerUserId: string;
}

export interface ReassignLinkerResult {
    ok: boolean;
    newLinker?: { user_id: string; display_name: string };
    reason?: string;
}

export interface ServerPayload {
    application_id: string;
    bot_token: string;
    public_key?: string;
    guild_id?: string;
}

export function toServerPayload(p: VerifyPayload, guildId?: string): ServerPayload {
    const out: ServerPayload = {
        application_id: p.applicationId,
        bot_token: p.botToken,
    };
    if (p.publicKey !== undefined) out.public_key = p.publicKey;
    if (guildId !== undefined) out.guild_id = guildId;
    return out;
}
