import { jsonFetch } from "../../shared/fetchers/json-fetcher.js";
import type { DiscordRoleState } from "./client-types.js";

export interface CreateRolePayload {
    userId: string;
    name: string;
    color?: number;
    hoist?: boolean;
    mentionable?: boolean;
    permissions?: string;
}

export interface DeleteRolePayload {
    userId: string;
    roleName: string;
}
export interface UpdateRolePayload {
    userId: string;
    before: DiscordRoleState;
    after: DiscordRoleState;
}

export async function createDiscordRole(guildId: string, payload: CreateRolePayload): Promise<boolean> {
    const res = await jsonFetch(`/api/discord/roles/${encodeURIComponent(guildId)}`, "POST", payload);
    return res.ok;
}

export async function deleteDiscordRole(guildId: string, roleId: string, payload: DeleteRolePayload): Promise<boolean> {
    const res = await jsonFetch(
        `/api/discord/roles/${encodeURIComponent(guildId)}/${encodeURIComponent(roleId)}`,
        "DELETE",
        payload,
    );
    return res.ok;
}

export async function updateDiscordRole(guildId: string, roleId: string, payload: UpdateRolePayload): Promise<boolean> {
    const res = await jsonFetch(
        `/api/discord/roles/${encodeURIComponent(guildId)}/${encodeURIComponent(roleId)}`,
        "PATCH",
        payload,
    );
    return res.ok;
}
