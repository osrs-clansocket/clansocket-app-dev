import { clanWomRow } from "../db-runners.js";

export type ActiveOutboundStatus = "pending" | "in_flight";

export interface ActiveOutboundRow {
    queue_id: string;
    status: ActiveOutboundStatus;
    scheduled_at: number;
}

const SELECT_ACTIVE_BY_KIND_SQL = `SELECT queue_id, status, scheduled_at
    FROM clan_wom_outbound_events
    WHERE request_kind = ? AND status IN ('pending', 'in_flight')
    ORDER BY scheduled_at DESC LIMIT 1`;

export function findActiveOutbound(clanId: string, requestKind: string): ActiveOutboundRow | null {
    return clanWomRow<ActiveOutboundRow>(clanId, SELECT_ACTIVE_BY_KIND_SQL, requestKind) ?? null;
}
