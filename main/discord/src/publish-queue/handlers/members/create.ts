import { PermissionsBitField, type Client, type Guild } from "discord.js";
import { ensureBotPermission } from "../../../validators/bot-permission.js";
import { registerPublisher } from "../../publisher-registry.js";
import { OP_KINDS, ENTITY_TYPES } from "../../publish-vocab.js";
import { runPublishOp } from "../../runners/op-runner.js";

const SUBJECT_UNBAN = "unban";

interface UnbanState {
    subject: typeof SUBJECT_UNBAN;
    targetUserId: string;
    reason: string | null;
}

export async function applyMemberCreate(client: Client, guild: Guild, data: UnbanState): Promise<null> {
    if (data.subject !== SUBJECT_UNBAN) throw new Error(`unsupported create subject: ${data.subject}`);
    await ensureBotPermission(client, guild.id, PermissionsBitField.Flags.BanMembers);
    await guild.bans.remove(data.targetUserId, data.reason ?? undefined);
    return null;
}

export type { UnbanState };

registerPublisher(OP_KINDS.CREATE, ENTITY_TYPES.MEMBER, {
    handler: (c, r) => runPublishOp(c, r, OP_KINDS.CREATE, (g, d) => applyMemberCreate(c, g, d as UnbanState)),
});
