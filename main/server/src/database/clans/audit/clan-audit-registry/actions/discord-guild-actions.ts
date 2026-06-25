import { ClanAuditActions } from "../../clan-audit-actions.js";
import { def } from "../action-def.js";
import { registerAuditAction } from "../action-store.js";
import { isBoolean, isString, requireStrings } from "../type-guards.js";
import {
    hasDiscordCore,
    withBoolean,
    withNumber,
    withNumberPair,
    withString,
    withStringPair,
} from "../discord-validator-combinators.js";
import { emoji, guildSettings, hook, requireTarget, sticker, withRename } from "./discord-action-shorthands.js";

registerAuditAction(ClanAuditActions.DiscordServerEmojisCreate, def("discord", emoji, true), withBoolean("animated"));
registerAuditAction(ClanAuditActions.DiscordServerEmojisRename, def("discord", emoji, true), withRename);
registerAuditAction(ClanAuditActions.DiscordServerEmojisDelete, def("discord", emoji, true), requireTarget);
registerAuditAction(
    ClanAuditActions.DiscordServerStickersCreate,
    def("discord", sticker, true),
    withNumber("formatType"),
);
registerAuditAction(ClanAuditActions.DiscordServerStickersRename, def("discord", sticker, true), withRename);
registerAuditAction(ClanAuditActions.DiscordServerStickersDelete, def("discord", sticker, true), requireTarget);

registerAuditAction(ClanAuditActions.DiscordGuildSettingsSetName, def("discord", guildSettings, true), withRename);
registerAuditAction(
    ClanAuditActions.DiscordGuildSettingsSetIcon,
    def("discord", guildSettings, true),
    withStringPair("beforeIconUrl", "afterIconUrl"),
);
registerAuditAction(
    ClanAuditActions.DiscordGuildSettingsSetBanner,
    def("discord", guildSettings, true),
    withStringPair("beforeBannerUrl", "afterBannerUrl"),
);
registerAuditAction(
    ClanAuditActions.DiscordGuildSettingsSetDescription,
    def("discord", guildSettings, true),
    withStringPair("beforeDescription", "afterDescription"),
);
registerAuditAction(
    ClanAuditActions.DiscordGuildSettingsSetSystemChannel,
    def("discord", guildSettings, true),
    withStringPair("beforeChannelId", "afterChannelId"),
);
registerAuditAction(ClanAuditActions.DiscordGuildSettingsSetAfk, def("discord", guildSettings, true), hasDiscordCore);
registerAuditAction(
    ClanAuditActions.DiscordGuildSettingsSetWelcomeScreen,
    def("discord", guildSettings, true),
    withBoolean("enabled"),
);
registerAuditAction(
    ClanAuditActions.DiscordGuildSettingsSetVerificationLevel,
    def("discord", guildSettings, true),
    withNumberPair("beforeLevel", "afterLevel"),
);

registerAuditAction(
    ClanAuditActions.DiscordAutoHookCreated,
    def("discord", hook, true),
    requireStrings("guildId", "targetName", "autoHookId", "autoHookName", "triggerType", "webhookId"),
);
registerAuditAction(
    ClanAuditActions.DiscordAutoHookUpdated,
    def("discord", hook, true),
    withStringPair("autoHookId", "autoHookName"),
);
registerAuditAction(ClanAuditActions.DiscordAutoHookDeleted, def("discord", hook, true), withString("autoHookId"));
registerAuditAction(
    ClanAuditActions.DiscordAutoHookToggled,
    def("discord", hook, true),
    (p) => hasDiscordCore(p) && isString(p.autoHookId) && isBoolean(p.enabled),
);
