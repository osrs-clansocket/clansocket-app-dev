import { PermissionsBitField, type Client, type Guild } from "discord.js";
import type { PendingPublishRow } from "../../../loaders/publish-queue-loader.js";
import { ensureBotPermission } from "../../../validators/bot-permission.js";
import { registerPublisher } from "../../publisher-registry.js";
import { OP_KINDS, ENTITY_TYPES } from "../../publish-vocab.js";
import { runPublishOp } from "../../runners/op-runner.js";

const SUBJECT_KICK = "kick";
const SUBJECT_BAN = "ban";

interface KickState {
    subject: typeof SUBJECT_KICK;
    targetUserId: string;
    reason: string | null;
}

interface BanState {
    subject: typeof SUBJECT_BAN;
    targetUserId: string;
    reason: string | null;
    deleteMessageDays: number | null;
}

type DeleteState = KickState | BanState;

const SECONDS_PER_DAY = 86400;

async function applyKick(client: Client, guild: Guild, data: KickState): Promise<void> {
    await ensureBotPermission(client, guild.id, PermissionsBitField.Flags.KickMembers);
    const member = await guild.members.fetch(data.targetUserId);
    await member.kick(data.reason ?? undefined);
}

async function applyBan(client: Client, guild: Guild, data: BanState): Promise<void> {
    await ensureBotPermission(client, guild.id, PermissionsBitField.Flags.BanMembers);
    const deleteMessageSeconds = data.deleteMessageDays === null ? undefined : data.deleteMessageDays * SECONDS_PER_DAY;
    await guild.bans.create(data.targetUserId, {
        reason: data.reason ?? undefined,
        deleteMessageSeconds,
    });
}

export function deleteMemberHandler(
    client: Client,
    row: PendingPublishRow,
): Promise<{ snowflakeResolved: string | null }> {
    return runPublishOp<DeleteState>(client, row, "delete", async (guild, data) => {
        switch (data.subject) {
            case SUBJECT_KICK:
                await applyKick(client, guild, data);
                break;
            case SUBJECT_BAN:
                await applyBan(client, guild, data);
                break;
            default:
                throw new Error(`unsupported delete subject: ${(data as { subject: string }).subject}`);
        }
    });
}

registerPublisher(OP_KINDS.DELETE, ENTITY_TYPES.MEMBER, { handler: deleteMemberHandler });
