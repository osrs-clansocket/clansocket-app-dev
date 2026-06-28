import type { Client, Guild, GuildMember } from "discord.js";
import type { PendingOutboundRow } from "../../loaders/outbound-loader.js";
import { registerSender } from "../sender-registry.js";

export const KIND_MEMBER_MUTATION = "member_mutation";

interface MemberMutationPayload {
    member_action: string;
    guild_id: string;
    role_id?: string;
    nickname?: string;
    reason?: string;
    duration_ms?: number;
    delete_message_days?: number;
}

function parsePayload(json: string): MemberMutationPayload {
    return JSON.parse(json) as MemberMutationPayload;
}

async function fetchTarget(
    client: Client,
    p: MemberMutationPayload,
    userId: string,
): Promise<{ guild: Guild; member: GuildMember }> {
    const guild = await client.guilds.fetch(p.guild_id);
    const member = await guild.members.fetch(userId);
    return { guild, member };
}

function requireRoleId(p: MemberMutationPayload): string {
    if (!p.role_id) throw new Error("member mutation: role_id required");
    return p.role_id;
}

async function addRole(client: Client, p: MemberMutationPayload, userId: string): Promise<string | null> {
    const { member } = await fetchTarget(client, p, userId);
    await member.roles.add(requireRoleId(p), p.reason);
    return member.id;
}

async function removeRole(client: Client, p: MemberMutationPayload, userId: string): Promise<string | null> {
    const { member } = await fetchTarget(client, p, userId);
    await member.roles.remove(requireRoleId(p), p.reason);
    return member.id;
}

async function setNickname(client: Client, p: MemberMutationPayload, userId: string): Promise<string | null> {
    const { member } = await fetchTarget(client, p, userId);
    await member.setNickname(p.nickname ?? null, p.reason);
    return member.id;
}

async function kickMember(client: Client, p: MemberMutationPayload, userId: string): Promise<string | null> {
    const { member } = await fetchTarget(client, p, userId);
    await member.kick(p.reason);
    return member.id;
}

async function banMember(client: Client, p: MemberMutationPayload, userId: string): Promise<string | null> {
    const guild = await client.guilds.fetch(p.guild_id);
    const deleteSeconds = (p.delete_message_days ?? 0) * 86_400;
    await guild.members.ban(userId, { reason: p.reason, deleteMessageSeconds: deleteSeconds });
    return userId;
}

async function unbanMember(client: Client, p: MemberMutationPayload, userId: string): Promise<string | null> {
    const guild = await client.guilds.fetch(p.guild_id);
    await guild.members.unban(userId, p.reason);
    return userId;
}

async function timeoutMember(client: Client, p: MemberMutationPayload, userId: string): Promise<string | null> {
    const { member } = await fetchTarget(client, p, userId);
    const duration = typeof p.duration_ms === "number" && p.duration_ms > 0 ? p.duration_ms : null;
    await member.timeout(duration, p.reason);
    return member.id;
}

const ACTION_HANDLERS: Record<
    string,
    (client: Client, p: MemberMutationPayload, userId: string) => Promise<string | null>
> = {
    "add-role": addRole,
    "remove-role": removeRole,
    "set-nickname": setNickname,
    kick: kickMember,
    ban: banMember,
    unban: unbanMember,
    timeout: timeoutMember,
};

export async function senderMemberMutation(client: Client, event: PendingOutboundRow): Promise<string | null> {
    if (!event.target_id) throw new Error("member_mutation requires target_id (user id)");
    const payload = parsePayload(event.payload_json);
    const handler = ACTION_HANDLERS[payload.member_action];
    if (!handler) throw new Error(`unknown member_action: ${payload.member_action}`);
    return handler(client, payload, event.target_id);
}

registerSender(KIND_MEMBER_MUTATION, senderMemberMutation);
