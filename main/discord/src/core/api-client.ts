import logger from "@clansocket/logger";
import { FALLBACK_UNKNOWN } from "./constants.js";
import { HTTP_METHOD_POST } from "./constants.js";
import { apiGet, apiRequest } from "../fetchers/api-fetcher.js";

interface PermissionsResponse {
    permissions?: string[];
}

interface RateLimitResponse {
    count?: number;
    reset_time?: number;
}

function describeError(err: Error & { code?: string }): string {
    return err.message || err.code || err.name || FALLBACK_UNKNOWN;
}

async function postAuditLog(guildId: string, userId: string, action: string, data: object = {}): Promise<void> {
    try {
        await apiRequest<unknown>(HTTP_METHOD_POST, "/api/discord/audit", { guildId, userId, action, data });
    } catch (err: any) {
        logger.error(`Failed to post audit log: ${describeError(err)}`, err);
    }
}

async function checkRateLimit(identifier: string): Promise<RateLimitResponse | null> {
    try {
        return await apiRequest<RateLimitResponse>(HTTP_METHOD_POST, "/api/discord/rate-limit/check", { identifier });
    } catch (err: any) {
        logger.error(`Rate limit check failed: ${describeError(err)}`, err);
        return null;
    }
}

async function setRateLimit(identifier: string, count: number, reset_time: number): Promise<void> {
    try {
        await apiRequest<unknown>(HTTP_METHOD_POST, "/api/discord/rate-limit/set", { identifier, count, reset_time });
    } catch (err: any) {
        logger.error(`Rate limit set failed: ${describeError(err)}`, err);
    }
}

async function getUserPermissions(userId: string, guildId: string): Promise<string[]> {
    try {
        const res = await apiGet<PermissionsResponse>(`/api/discord/permissions/${guildId}/${userId}`);
        return Array.isArray(res?.permissions) ? res.permissions : [];
    } catch (err: any) {
        logger.error(`Get permissions failed: ${describeError(err)}`, err);
        return [];
    }
}

export { checkRateLimit, getUserPermissions, postAuditLog, setRateLimit };
