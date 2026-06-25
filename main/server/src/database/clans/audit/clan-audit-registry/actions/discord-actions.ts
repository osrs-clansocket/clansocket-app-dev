import { ClanAuditActions } from "../../clan-audit-actions.js";
import { def } from "../action-def.js";
import { registerAuditAction } from "../action-store.js";
import { isNumber, isString, requireStrings } from "../type-guards.js";
import { hasDiscordCore, hasOverwriteTarget, withString, withStringPair } from "../discord-validator-combinators.js";
import {
    botIdentity,
    channel,
    member,
    requireMember,
    requireMemberWithRole,
    role,
    webhook,
    webhookToken,
    withBeforeAfter,
    withChannelId,
    withChannelType,
    withMove,
} from "./discord-action-shorthands.js";

registerAuditAction(ClanAuditActions.DiscordChannelsCreate, def("discord", channel, true), withChannelType);
registerAuditAction(
    ClanAuditActions.DiscordChannelsUpdate,
    def("discord", channel, true, { hasBeforeAfter: true }),
    withBeforeAfter,
);
registerAuditAction(ClanAuditActions.DiscordChannelsDelete, def("discord", channel, true), withChannelType);
registerAuditAction(ClanAuditActions.DiscordChannelsMove, def("discord", channel, true), withMove);
registerAuditAction(
    ClanAuditActions.DiscordChannelsSetPermissions,
    def("discord", channel, true),
    (p) => hasDiscordCore(p) && hasOverwriteTarget(p) && isString(p.allow) && isString(p.deny),
);
registerAuditAction(
    ClanAuditActions.DiscordChannelsDeletePermissions,
    def("discord", channel, true),
    (p) => hasDiscordCore(p) && hasOverwriteTarget(p),
);

registerAuditAction(
    ClanAuditActions.DiscordRolesCreate,
    def("discord", role, true),
    (p) => hasDiscordCore(p) && isNumber(p.color) && isString(p.permissions),
);
registerAuditAction(
    ClanAuditActions.DiscordRolesUpdate,
    def("discord", role, true, { hasBeforeAfter: true }),
    withBeforeAfter,
);
registerAuditAction(ClanAuditActions.DiscordRolesDelete, def("discord", role, true), hasDiscordCore);
registerAuditAction(ClanAuditActions.DiscordRolesSetPosition, def("discord", role, true), withMove);
registerAuditAction(
    ClanAuditActions.DiscordRolesSetPermissions,
    def("discord", role, true),
    withStringPair("beforePermissions", "afterPermissions"),
);
registerAuditAction(
    ClanAuditActions.DiscordBotLinkerReassigned,
    def("server", botIdentity, true),
    requireStrings("previous_linker", "new_linker", "by_owner"),
);

registerAuditAction(ClanAuditActions.DiscordMembersSetNickname, def("discord", member, true), requireMember);
registerAuditAction(ClanAuditActions.DiscordMembersAddRole, def("discord", member, true), requireMemberWithRole);
registerAuditAction(ClanAuditActions.DiscordMembersRemoveRole, def("discord", member, true), requireMemberWithRole);
registerAuditAction(ClanAuditActions.DiscordMembersTimeout, def("discord", member, true), requireMember);
registerAuditAction(ClanAuditActions.DiscordMembersKick, def("discord", member, true), requireMember);
registerAuditAction(ClanAuditActions.DiscordMembersBan, def("discord", member, true), requireMember);
registerAuditAction(ClanAuditActions.DiscordMembersUnban, def("discord", member, true), requireMember);

registerAuditAction(
    ClanAuditActions.DiscordWebhooksCreate,
    def("discord", webhook, true),
    (p) => hasDiscordCore(p) && isString(p.channelId) && isNumber(p.webhookType),
);
registerAuditAction(
    ClanAuditActions.DiscordWebhooksUpdate,
    def("discord", webhook, true, { hasBeforeAfter: true }),
    withBeforeAfter,
);
registerAuditAction(ClanAuditActions.DiscordWebhooksDelete, def("discord", webhook, true), withChannelId);
registerAuditAction(ClanAuditActions.DiscordWebhooksRegenerateToken, def("discord", webhook, true), withChannelId);
registerAuditAction(
    ClanAuditActions.DiscordWebhookTokenRevoked,
    def("discord", webhookToken, true),
    withString("webhookId"),
);
