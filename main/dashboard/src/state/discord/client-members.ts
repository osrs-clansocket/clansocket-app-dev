import { jsonFetch } from "../../shared/fetchers/json-fetcher.js";

export interface SetNicknamePayload {
    userId: string;
    targetUserId: string;
    targetUserName: string;
    beforeNickname: string | null;
    nickname: string | null;
}

export interface KickMemberPayload {
    userId: string;
    targetUserName: string;
    reason?: string;
}

export async function setMemberNickname(guildId: string, payload: SetNicknamePayload): Promise<boolean> {
    const res = await jsonFetch(
        `/api/discord/members/${encodeURIComponent(guildId)}/${encodeURIComponent(payload.targetUserId)}/nickname`,
        "PATCH",
        payload,
    );
    return res.ok;
}

export async function kickDiscordMember(
    guildId: string,
    targetUserId: string,
    payload: KickMemberPayload,
): Promise<boolean> {
    const res = await jsonFetch(
        `/api/discord/members/${encodeURIComponent(guildId)}/${encodeURIComponent(targetUserId)}/kick`,
        "POST",
        payload,
    );
    return res.ok;
}
