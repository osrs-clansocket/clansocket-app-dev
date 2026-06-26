import logger from "@clansocket/logger";
import { orThrow } from "../shared/nullable.js";
import { apiGet } from "../fetchers/api-fetcher.js";
import type { BotIdentity } from "../shared/types/bot-types.js";

const RETRY_DELAYS_MS = [500, 1000, 2000, 4000, 8000];
const RETRY_TRANSIENT_CODES: ReadonlySet<string> = new Set(["ECONNREFUSED", "ECONNRESET", "ENOTFOUND", "EAI_AGAIN"]);
const BOTS_PATH = "/api/discord/bots";

function retryTransientCode(err: unknown): string | null {
    const code = (err as Error & { code?: string }).code;
    return typeof code === "string" && RETRY_TRANSIENT_CODES.has(code) ? code : null;
}

function retryDelay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        // eslint-disable-next-line lvi/no-timer-heuristic -- cold-start connectivity backoff
        setTimeout(resolve, ms);
    });
}

async function fetchBots(): Promise<BotIdentity[]> {
    const body = orThrow(
        await apiGet<{ bots: BotIdentity[] }>(BOTS_PATH),
        `loadBots: unexpected null response from ${BOTS_PATH}`,
    );
    return body.bots;
}

export async function loadBots(): Promise<BotIdentity[]> {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
        try {
            return await fetchBots();
        } catch (err: unknown) {
            const code = retryTransientCode(err);
            if (!code) throw err;
            lastErr = err;
            if (attempt === RETRY_DELAYS_MS.length) break;
            const delay = RETRY_DELAYS_MS[attempt]!;
            logger.warn(`loadBots: server unreachable (${code}), retrying in ${delay}ms`);
            await retryDelay(delay);
        }
    }
    throw lastErr;
}
