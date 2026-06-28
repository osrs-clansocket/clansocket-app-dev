import type { Client, Guild } from "discord.js";
import type { PendingOutboundRow } from "../../loaders/outbound-loader.js";
import { registerSender } from "../sender-registry.js";

export const KIND_STRUCTURAL_MUTATION = "structural_mutation";

interface StructuralMutationPayload {
    structural_action: string;
    guild_id: string;
    name?: string;
    topic?: string;
    color?: number;
    hoist?: boolean;
    mentionable?: boolean;
    parent_id?: string;
    position?: number;
    channel_id?: string;
    channel_type?: number;
    nsfw?: boolean;
    bitrate?: number;
    user_limit?: number;
    rate_limit_per_user?: number;
    avatar_url?: string;
    reason?: string;
}

function parsePayload(json: string): StructuralMutationPayload {
    return JSON.parse(json) as StructuralMutationPayload;
}

async function channelCreate(client: Client, p: StructuralMutationPayload): Promise<string | null> {
    const guild = await fetchGuild(client, p.guild_id);
    const name = typeof p.name === "string" ? p.name : "";
    if (name.length === 0) throw new Error("channel.create requires payload.name");
    const opts: Record<string, unknown> = { name };
    if (typeof p.channel_type === "number") opts.type = p.channel_type;
    if (typeof p.topic === "string") opts.topic = p.topic;
    if (typeof p.parent_id === "string") opts.parent = p.parent_id;
    if (typeof p.position === "number") opts.position = p.position;
    if (typeof p.nsfw === "boolean") opts.nsfw = p.nsfw;
    if (typeof p.bitrate === "number") opts.bitrate = p.bitrate;
    if (typeof p.user_limit === "number") opts.userLimit = p.user_limit;
    if (typeof p.rate_limit_per_user === "number") opts.rateLimitPerUser = p.rate_limit_per_user;
    if (typeof p.reason === "string") opts.reason = p.reason;
    const channel = await guild.channels.create(opts as unknown as Parameters<typeof guild.channels.create>[0]);
    return channel.id;
}

async function channelUpdate(client: Client, p: StructuralMutationPayload, channelId: string): Promise<string | null> {
    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error(`channel not found: ${channelId}`);
    const edit: Record<string, unknown> = {};
    if (typeof p.name === "string") edit.name = p.name;
    if (typeof p.topic === "string") edit.topic = p.topic;
    if (typeof p.parent_id === "string") edit.parent = p.parent_id;
    if (typeof p.position === "number") edit.position = p.position;
    await (channel as { edit: (opts: Record<string, unknown>, reason?: string) => Promise<unknown> }).edit(
        edit,
        p.reason,
    );
    return channelId;
}

async function channelDelete(client: Client, p: StructuralMutationPayload, channelId: string): Promise<string | null> {
    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error(`channel not found: ${channelId}`);
    await (channel as { delete: (reason?: string) => Promise<unknown> }).delete(p.reason);
    return channelId;
}

async function fetchGuild(client: Client, guildId: string): Promise<Guild> {
    return client.guilds.fetch(guildId);
}

async function roleCreate(client: Client, p: StructuralMutationPayload): Promise<string | null> {
    const guild = await fetchGuild(client, p.guild_id);
    const opts: Record<string, unknown> = {};
    if (typeof p.name === "string") opts.name = p.name;
    if (typeof p.color === "number") opts.color = p.color;
    if (typeof p.hoist === "boolean") opts.hoist = p.hoist;
    if (typeof p.mentionable === "boolean") opts.mentionable = p.mentionable;
    if (typeof p.reason === "string") opts.reason = p.reason;
    const role = await guild.roles.create(opts);
    return role.id;
}

async function roleDelete(client: Client, p: StructuralMutationPayload, roleId: string): Promise<string | null> {
    const guild = await fetchGuild(client, p.guild_id);
    const role = await guild.roles.fetch(roleId);
    if (!role) throw new Error(`role not found: ${roleId}`);
    await role.delete(p.reason);
    return roleId;
}

async function roleUpdate(client: Client, p: StructuralMutationPayload, roleId: string): Promise<string | null> {
    const guild = await fetchGuild(client, p.guild_id);
    const role = await guild.roles.fetch(roleId);
    if (!role) throw new Error(`role not found: ${roleId}`);
    const edit: Record<string, unknown> = {};
    if (typeof p.name === "string") edit.name = p.name;
    if (typeof p.color === "number") edit.color = p.color;
    if (typeof p.hoist === "boolean") edit.hoist = p.hoist;
    if (typeof p.mentionable === "boolean") edit.mentionable = p.mentionable;
    await role.edit(edit as Record<string, unknown> & { reason?: string });
    return roleId;
}

async function roleSetPosition(client: Client, p: StructuralMutationPayload, roleId: string): Promise<string | null> {
    const guild = await fetchGuild(client, p.guild_id);
    const role = await guild.roles.fetch(roleId);
    if (!role) throw new Error(`role not found: ${roleId}`);
    const position = typeof p.position === "number" ? p.position : 0;
    await role.setPosition(position, { reason: p.reason });
    return roleId;
}

async function webhookCreate(client: Client, p: StructuralMutationPayload, channelId: string): Promise<string | null> {
    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error(`channel not found: ${channelId}`);
    const name = typeof p.name === "string" ? p.name : "";
    if (name.length === 0) throw new Error("webhook.create requires payload.name");
    const opts: Record<string, unknown> = { name };
    if (typeof p.avatar_url === "string") opts.avatar = p.avatar_url;
    if (typeof p.reason === "string") opts.reason = p.reason;
    const webhook = await (
        channel as unknown as {
            createWebhook: (opts: Record<string, unknown>) => Promise<{ id: string }>;
        }
    ).createWebhook(opts);
    return webhook.id;
}

async function webhookDelete(client: Client, p: StructuralMutationPayload, webhookId: string): Promise<string | null> {
    const webhook = await client.fetchWebhook(webhookId);
    if (!webhook) throw new Error(`webhook not found: ${webhookId}`);
    await webhook.delete(p.reason);
    return webhookId;
}

async function channelMove(client: Client, p: StructuralMutationPayload, channelId: string): Promise<string | null> {
    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error(`channel not found: ${channelId}`);
    const position = typeof p.position === "number" ? p.position : 0;
    await (channel as { setPosition: (position: number, opts?: { reason?: string }) => Promise<unknown> }).setPosition(
        position,
        { reason: p.reason },
    );
    return channelId;
}

const ACTION_HANDLERS: Record<
    string,
    (client: Client, p: StructuralMutationPayload, targetId: string) => Promise<string | null>
> = {
    "channel.create": (client, p) => channelCreate(client, p),
    "channel.update": channelUpdate,
    "channel.delete": channelDelete,
    "channel.move": channelMove,
    "role.create": (client, p) => roleCreate(client, p),
    "role.delete": roleDelete,
    "role.update": roleUpdate,
    "role.set-position": roleSetPosition,
    "webhook.create": webhookCreate,
    "webhook.delete": webhookDelete,
};

export async function senderStructuralMutation(client: Client, event: PendingOutboundRow): Promise<string | null> {
    if (!event.target_id) throw new Error("structural_mutation requires target_id");
    const payload = parsePayload(event.payload_json);
    const handler = ACTION_HANDLERS[payload.structural_action];
    if (!handler) throw new Error(`unknown structural_action: ${payload.structural_action}`);
    return handler(client, payload, event.target_id);
}

registerSender(KIND_STRUCTURAL_MUTATION, senderStructuralMutation);
