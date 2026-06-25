import { STATUS_PENDING } from "../../../shared/constants/outbound-status.js";
import { listBotRows } from "../db-runners.js";

export interface PendingOutboundRow {
    queue_id: string;
    bot_id: string;
    guild_id: string;
    clan_id: string;
    target_kind: string;
    target_id: string | null;
    payload_json: string;
    attempts: number;
}

export function listPendingBot(botId: string): PendingOutboundRow[] {
    return listBotRows<PendingOutboundRow>(
        `SELECT queue_id, bot_id, guild_id, clan_id, target_kind, target_id, payload_json, attempts
         FROM discord_outbound_events
         WHERE bot_id = ?
           AND status = ?
           AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
         ORDER BY next_attempt_at ASC, scheduled_at ASC`,
        botId,
        STATUS_PENDING,
        Date.now(),
    );
}
