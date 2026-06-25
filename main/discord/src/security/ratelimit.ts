import logger from "@clansocket/logger";
import { checkRateLimit as fetchLimit, setRateLimit as pushLimit } from "../core/api-client.js";
import config from "../core/config.js";

const { rateLimitMaxRequests: maxRequests, rateLimitWindow } = config.security;
const DEFAULT_COMMAND = "global";
const ZERO = 0;

function createIdentifier(userId: any, guildId: any, command: any) {
    return `${guildId}:${userId}:${command}`;
}

function buildResult(count: any, resetTime: any, now: any) {
    return {
        count,
        resetTime,
        remaining: Math.max(ZERO, maxRequests - count),
        resetIn: resetTime ? Math.max(ZERO, resetTime - now) : ZERO,
    };
}

export async function checkRateLimit(userId: any, guildId: any, command: any = DEFAULT_COMMAND) {
    try {
        const identifier = createIdentifier(userId, guildId, command);
        const now = Date.now();
        const existing: any = await fetchLimit(identifier);
        const isNew = !existing || now >= existing.reset_time;

        if (isNew) {
            await pushLimit(identifier, 1, now + rateLimitWindow);
            return { allowed: 1, remaining: maxRequests - 1 };
        }

        if (existing.count >= maxRequests) {
            return { allowed: ZERO, ...buildResult(existing.count, existing.reset_time, now) };
        }

        const newCount = existing.count + 1;
        await pushLimit(identifier, newCount, existing.reset_time);
        return { allowed: 1, remaining: maxRequests - newCount };
    } catch (rateLimitError: any) {
        logger.error("Error checking rate limit:", { error: rateLimitError.message });
        return { allowed: 1, remaining: maxRequests };
    }
}
