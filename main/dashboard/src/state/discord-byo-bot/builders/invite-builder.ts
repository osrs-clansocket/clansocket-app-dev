import { PERMISSION_BIT_BY_NAME } from "../../../shared/constants/clan-manage-discord/permission-flags-constants.js";

const OAUTH_BASE_URL = "https://discord.com/oauth2/authorize";
const OAUTH_SCOPE = "bot+applications.commands";

const CLANSOCKET_PERMISSION_NAMES = [
    "KickMembers",
    "BanMembers",
    "ManageChannels",
    "ManageGuild",
    "ViewChannel",
    "SendMessages",
    "ManageMessages",
    "ReadMessageHistory",
    "ManageRoles",
    "ManageWebhooks",
    "ManageGuildExpressions",
    "UseApplicationCommands",
    "ModerateMembers",
] as const;

function computeBitfield(): string {
    let combined = 0n;
    for (const name of CLANSOCKET_PERMISSION_NAMES) {
        const bit = PERMISSION_BIT_BY_NAME.get(name);
        if (bit === undefined) throw new Error(`unknown Discord permission: ${name}`);
        combined |= 1n << BigInt(bit);
    }
    return combined.toString();
}

const PERMISSIONS_BITFIELD = computeBitfield();

export function inviteUrl(applicationId: string): string {
    return `${OAUTH_BASE_URL}?client_id=${applicationId}&permissions=${PERMISSIONS_BITFIELD}&scope=${OAUTH_SCOPE}`;
}
