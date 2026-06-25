import type { Channel, Guild, PermissionOverwriteOptions } from "discord.js";
import { PermissionsBitField } from "discord.js";
import { registerPublisher } from "../../publisher-registry.js";
import { runPublishOp } from "../../runners/op-runner.js";
import { dispatcherBySubject } from "../../../shared/subject-dispatcher.js";

const SUBJECT_PERMISSIONS = "permissions";
const SUBJECT_PERMISSIONS_DELETE = "permissions-delete";

interface ChannelEditState {
    name?: string;
    topic?: string | null;
    nsfw?: boolean;
    rateLimitPerUser?: number;
    parentId?: string | null;
}

interface ChannelPermissionsState {
    subject: typeof SUBJECT_PERMISSIONS;
    overwriteKind: "role" | "member";
    overwriteTargetId: string;
    allow: string;
    deny: string;
}

interface ChannelPermissionsDelete {
    subject: typeof SUBJECT_PERMISSIONS_DELETE;
    overwriteKind: "role" | "member";
    overwriteTargetId: string;
}

function bitfieldBoolMap(allow: string, deny: string): PermissionOverwriteOptions {
    const opts: Record<string, boolean | null> = {};
    const allowBits = new PermissionsBitField(BigInt(allow));
    const denyBits = new PermissionsBitField(BigInt(deny));
    for (const flag of allowBits.toArray()) opts[flag] = true;
    for (const flag of denyBits.toArray()) opts[flag] = false;
    return opts as PermissionOverwriteOptions;
}

async function fetchOverwriteCapable(
    guild: Guild,
    channelId: string,
): Promise<Channel & { permissionOverwrites: any }> {
    const channel = await guild.channels.fetch(channelId);
    if (!channel || !("permissionOverwrites" in channel)) throw new Error(`channel ${channelId} not overwrite-capable`);
    return channel as any;
}

const SUBJECT_APPLIERS: Record<string, (guild: Guild, channelId: string, data: any) => Promise<unknown>> = {
    [SUBJECT_PERMISSIONS]: async (g, ch, d: ChannelPermissionsState) => {
        const channel = await fetchOverwriteCapable(g, ch);
        await channel.permissionOverwrites.create(d.overwriteTargetId, bitfieldBoolMap(d.allow, d.deny));
    },
    [SUBJECT_PERMISSIONS_DELETE]: async (g, ch, d: ChannelPermissionsDelete) => {
        const channel = await fetchOverwriteCapable(g, ch);
        await channel.permissionOverwrites.delete(d.overwriteTargetId);
    },
};

async function applyChannelEdit(guild: Guild, channelId: string, data: ChannelEditState): Promise<void> {
    const channel = await guild.channels.fetch(channelId);
    if (!channel) throw new Error(`channel ${channelId} not found`);
    await channel.edit({
        name: data.name,
        topic: data.topic,
        nsfw: data.nsfw,
        rateLimitPerUser: data.rateLimitPerUser,
        parent: data.parentId,
    });
}

export const applyChannelUpdate = dispatcherBySubject<ChannelEditState>(SUBJECT_APPLIERS, applyChannelEdit);

registerPublisher("update", "discord_channel", {
    handler: (c, r) =>
        runPublishOp(c, r, "update", (g, d) =>
            applyChannelUpdate(g, r.target_id_or_temp, d as Record<string, unknown>),
        ),
    requiredBotPermission: PermissionsBitField.Flags.ManageChannels,
});
