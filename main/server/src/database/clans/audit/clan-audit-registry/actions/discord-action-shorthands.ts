import { ClanAuditTargetTypes } from "../../clan-audit-actions.js";
import { requireStrings } from "../type-guards.js";
import {
    hasBeforeAfter,
    hasDiscordCore,
    withNumber,
    withNumberPair,
    withString,
    withStringPair,
} from "../discord-validator-combinators.js";

export const withChannelType = withNumber("channelType");
export const withMove = withNumberPair("beforePosition", "afterPosition");
export const withChannelId = withString("channelId");
export const withRename = withStringPair("beforeName", "afterName");
export const withBeforeAfter = (p: Record<string, unknown>): boolean => hasDiscordCore(p) && hasBeforeAfter(p);

export const requireMember = requireStrings("guildId", "userId", "userName");
export const requireMemberWithRole = requireStrings("guildId", "userId", "userName", "roleId", "roleName");
export const requireTarget = requireStrings("guildId", "targetName");

export const channel = ClanAuditTargetTypes.DiscordChannel;
export const role = ClanAuditTargetTypes.DiscordRole;
export const member = ClanAuditTargetTypes.DiscordMember;
export const webhook = ClanAuditTargetTypes.DiscordWebhook;
export const emoji = ClanAuditTargetTypes.DiscordEmoji;
export const sticker = ClanAuditTargetTypes.DiscordSticker;
export const guildSettings = ClanAuditTargetTypes.DiscordGuildSettings;
export const hook = ClanAuditTargetTypes.DiscordAutoHook;
export const webhookToken = ClanAuditTargetTypes.DiscordWebhookToken;
export const botIdentity = ClanAuditTargetTypes.DiscordBotIdentity;
