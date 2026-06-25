import { PERMISSION_FLAG_NAMES } from "../../../shared/constants/clan-manage-discord/permission-flags-constants.js";

const GUILD_ONLY_PERMISSIONS: ReadonlySet<string> = new Set([
    "KickMembers",
    "BanMembers",
    "Administrator",
    "ManageGuild",
    "ViewAuditLog",
    "ChangeNickname",
    "ManageNicknames",
    "ViewGuildInsights",
    "ModerateMembers",
    "ManageEmojisAndStickers",
    "ManageGuildExpressions",
    "CreateGuildExpressions",
    "ManageEvents",
    "CreateEvents",
    "ViewCreatorMonetizationAnalytics",
]);

export function isGuildOnly(bit: number): boolean {
    const name = PERMISSION_FLAG_NAMES[bit];
    if (name === undefined) return false;
    return GUILD_ONLY_PERMISSIONS.has(name);
}
