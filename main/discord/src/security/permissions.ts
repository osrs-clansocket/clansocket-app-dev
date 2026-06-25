import logger from "@clansocket/logger";
import { getUserPermissions as fetchPermissions } from "../core/api-client.js";
import { DISCORD_PERMISSIONS } from "../core/constants.js";

const EMPTY_PERMISSIONS: any[] = [];

function hasAdminPermission(perms: any) {
    return Array.isArray(perms) && perms.includes(DISCORD_PERMISSIONS.ADMINISTRATOR);
}

function hasPermission(userPermissions: any, requiredPermission: any) {
    if (!Array.isArray(userPermissions)) {
        return 0;
    }
    if (!requiredPermission || hasAdminPermission(userPermissions)) {
        return 1;
    }
    return userPermissions.includes(requiredPermission) ? 1 : 0;
}

async function getUserPermissions(userId: any, guildId: any) {
    try {
        return await fetchPermissions(userId, guildId);
    } catch (permError: any) {
        logger.error("Error getting user permissions:", { error: permError.message });
        return EMPTY_PERMISSIONS;
    }
}

export async function checkCommandPermission(userId: any, guildId: any, requiredPermission: any) {
    if (!requiredPermission) {
        return 1;
    }
    try {
        const userPermissions = await getUserPermissions(userId, guildId);
        return hasPermission(userPermissions, requiredPermission);
    } catch (permError: any) {
        logger.error("Error checking command permission:", { error: permError.message });
        return 0;
    }
}
