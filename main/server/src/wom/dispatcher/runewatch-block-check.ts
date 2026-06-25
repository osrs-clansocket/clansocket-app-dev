import logger from "@clansocket/logger";
import { normalizeRsn } from "../../database/clans/access/clan-roster/lookups.js";
import type { PendingWomRow } from "../../database/wom/outbound/list-pending.js";
import { checkRunewatchBlock } from "../../runewatch/gates/check-block-gate.js";
import { routeWomResponse } from "../handlers/response-router.js";
import { REQUEST_KIND_PLAYER_SNAPSHOT, parseUsernamePath } from "./sdk-handlers.js";

export function isRunewatchBlocked(head: PendingWomRow): boolean {
    if (head.request_kind !== REQUEST_KIND_PLAYER_SNAPSHOT) return false;
    const rsn = parseUsernamePath(head.request_path);
    if (!rsn) return false;
    return checkRunewatchBlock(normalizeRsn(rsn)).blocked === "hard";
}

export function safeRouteResponse(clanId: string, head: PendingWomRow, result: unknown): void {
    if (isRunewatchBlocked(head)) {
        logger.info(`[wom-dispatcher] runewatch_blocked drop clan=${clanId} path=${head.request_path}`);
        return;
    }
    try {
        routeWomResponse(clanId, head.request_kind, head.body_json, result);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error(`[wom-dispatcher] response routing failed clan=${clanId} kind=${head.request_kind}: ${message}`);
    }
}
