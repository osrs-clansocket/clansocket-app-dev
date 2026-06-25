import type { EventEnvelopeCols } from "../envelope.js";
import { rowDedupHash } from "../envelope.js";
import type { HandlerCtx } from "../handler-ctx.js";
import type { PlayerIdentity, SpatialColumns } from "../projection-utils.js";
import { flatWhere, parseCause, parseRespawn } from "./death-parsers.js";
import { insertLostItem, readLostItems } from "./lost-items.js";
import type { DeathCause, DeathInsertArgs } from "./death-types.js";

const INSERT_DEATH_SQL = `INSERT INTO plugin_deaths
    (account_hash, rsn, session_id, session_seq, event_received_at,
     plugin_version, cause_kind, cause_id, cause_name, cause_combat_level,
     cause_category, hp_before, world, x, y, plane, region_id, region_name, area,
     respawn_x, respawn_y, respawn_plane, respawn_region_id,
     respawn_region_name, respawn_area, dedup_hash)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
 ON CONFLICT(dedup_hash) DO NOTHING`;

function envelopeParams(e: DeathInsertArgs["envelope"]): unknown[] {
    return [e.session_id, e.session_seq, e.event_received_at, e.plugin_version];
}

function causeParams(c: DeathInsertArgs["cause"]): unknown[] {
    return [c.causeKind, c.causeId, c.causeName, c.causeCombatLevel, c.causeCategory, c.hpBefore];
}

function whereParams(w: DeathInsertArgs["where"]): unknown[] {
    return [w.world ?? 0, w.x ?? 0, w.y ?? 0, w.plane ?? 0, w.region_id ?? 0, w.region_name ?? "", w.area];
}

function respawnParams(r: DeathInsertArgs["respawn"]): unknown[] {
    return [r.respawnX, r.respawnY, r.respawnPlane, r.respawnRegionId, r.respawnRegionName, r.respawnArea];
}

function flattenDeathParams(args: DeathInsertArgs): unknown[] {
    const { id, envelope, where, cause, respawn, dedup } = args;
    return [
        id.accountHash,
        id.rsn ?? "",
        ...envelopeParams(envelope),
        ...causeParams(cause),
        ...whereParams(where),
        ...respawnParams(respawn),
        dedup,
    ];
}

function insertDeathRow(args: DeathInsertArgs): number | null {
    const result = args.conn.prepare(INSERT_DEATH_SQL).run(...flattenDeathParams(args));
    const deathId = result.lastInsertRowid;
    return typeof deathId === "number" ? deathId : null;
}

function buildDeathDedup(
    id: PlayerIdentity,
    envelope: EventEnvelopeCols,
    where: SpatialColumns,
    cause: DeathCause,
): string {
    return rowDedupHash(
        id.accountHash,
        "death",
        cause.causeKind,
        cause.causeId ?? 0,
        envelope.session_seq,
        where.world ?? 0,
        where.x ?? 0,
        where.y ?? 0,
        where.plane ?? 0,
    );
}

export function handleDeath(ctx: HandlerCtx): void {
    const { conn, payload, envelope, id } = ctx;
    const where = flatWhere(payload);
    const cause = parseCause(payload);
    const respawn = parseRespawn(payload);
    const dedup = buildDeathDedup(id, envelope, where, cause);
    conn.transaction(() => {
        const deathId = insertDeathRow({ conn, id, envelope, where, cause, respawn, dedup });
        if (deathId === null) return;
        const lostItems = readLostItems(payload);
        if (lostItems.length === 0) return;
        const insertLost = conn.prepare(
            `INSERT INTO plugin_deaths_lost_items (death_id, item_id, item_name, qty, unit_price_gp)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT (death_id, item_id) DO UPDATE SET
                qty = plugin_deaths_lost_items.qty + excluded.qty,
                item_name = excluded.item_name,
                unit_price_gp = COALESCE(excluded.unit_price_gp, unit_price_gp)`,
        );
        for (const item of lostItems) insertLostItem(insertLost, deathId, item);
    })();
}
