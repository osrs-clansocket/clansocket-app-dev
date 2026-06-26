import { PermissionsBitField, type Client, type Guild, type GuildMember } from "discord.js";
import { orThrow } from "../../../shared/nullable.js";
import { validateBotPermission } from "../../../validators/bot-permission.js";
import { registerPublisher } from "../../publisher-registry.js";
import { OP_KINDS, ENTITY_TYPES } from "../../publish-vocab.js";
import { runPublishOp } from "../../runners/op-runner.js";

const SUBJECT_NICKNAME = "nickname";
const SUBJECT_ADD_ROLE = "add-role";
const SUBJECT_REMOVE_ROLE = "remove-role";
const SUBJECT_TIMEOUT = "timeout";

interface NicknameState {
    subject: typeof SUBJECT_NICKNAME;
    targetUserId: string;
    nickname: string | null;
}

interface AddRoleState {
    subject: typeof SUBJECT_ADD_ROLE;
    targetUserId: string;
    roleId: string;
}

interface RemoveRoleState {
    subject: typeof SUBJECT_REMOVE_ROLE;
    targetUserId: string;
    roleId: string;
}

interface TimeoutState {
    subject: typeof SUBJECT_TIMEOUT;
    targetUserId: string;
    communicationDisabledUntil: number | null;
    reason: string | null;
}

type UpdateState = NicknameState | AddRoleState | RemoveRoleState | TimeoutState;

type MutateFn = (member: GuildMember) => Promise<unknown>;

interface MemberMutationArgs {
    client: Client;
    guild: Guild;
    perm: bigint;
    targetUserId: string;
    mutate: MutateFn;
}

const spec = (perm: bigint, mutate: MutateFn): [bigint, MutateFn] => [perm, mutate];

async function applyMemberMutation(args: MemberMutationArgs): Promise<void> {
    const ok = await validateBotPermission({
        client: args.client,
        guildId: args.guild.id,
        requiredPermission: args.perm,
    });
    orThrow(ok, `bot_permission_denied: ${String(args.perm)}`);
    const member = await args.guild.members.fetch(args.targetUserId);
    await args.mutate(member);
}

function pickMutation(data: UpdateState): [bigint, MutateFn] {
    switch (data.subject) {
        case SUBJECT_NICKNAME:
            return spec(PermissionsBitField.Flags.ManageNicknames, (m) => m.setNickname(data.nickname));
        case SUBJECT_ADD_ROLE:
            return spec(PermissionsBitField.Flags.ManageRoles, (m) => m.roles.add(data.roleId));
        case SUBJECT_REMOVE_ROLE:
            return spec(PermissionsBitField.Flags.ManageRoles, (m) => m.roles.remove(data.roleId));
        case SUBJECT_TIMEOUT: {
            const until = data.communicationDisabledUntil;
            const duration = until === null ? null : Math.max(0, until - Date.now());
            return spec(PermissionsBitField.Flags.ModerateMembers, (m) =>
                m.timeout(duration, data.reason ?? undefined),
            );
        }
        default:
            throw new Error(`unsupported update subject: ${(data as { subject: string }).subject}`);
    }
}

export async function applyMemberUpdate(client: Client, guild: Guild, data: UpdateState): Promise<void> {
    const [perm, mutate] = pickMutation(data);
    const { targetUserId } = data;
    await applyMemberMutation({ client, guild, perm, targetUserId, mutate });
}

registerPublisher(OP_KINDS.UPDATE, ENTITY_TYPES.MEMBER, {
    handler: (c, r) => runPublishOp(c, r, OP_KINDS.UPDATE, (g, d) => applyMemberUpdate(c, g, d as UpdateState)),
});
