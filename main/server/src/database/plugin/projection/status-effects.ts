import type Database from "better-sqlite3";
import { SQL_COLUMNS } from "../../core/sql-columns.js";
import { buildChangeEmitter } from "./change-inserter.js";
import type { HandlerCtx } from "./handler-ctx.js";
import { extractWhere } from "./projection-utils.js";
import { EVENT_STATUS_EFFECT } from "../../../plugin-api/event-types.js";
import { registerPluginEvent } from "../../../flows/registries/plugin-event-registry.js";

function readPriorActive(conn: Database.Database, accountHash: string, effect: string): number | null {
    const row = conn
        .prepare("SELECT active FROM plugin_status_effects WHERE account_hash = ? AND effect = ?")
        .get(accountHash, effect) as { active: number } | undefined;
    return row?.active ?? null;
}

interface UpsertStatusEffect {
    conn: Database.Database;
    accountHash: string;
    rsn: string | null;
    effect: string;
    active: number;
    now: number;
}

function upsertStatusEffect(args: UpsertStatusEffect): void {
    const { conn, accountHash, rsn, effect, active, now } = args;
    conn.prepare(
        `INSERT INTO plugin_status_effects (account_hash, rsn, effect, active, first_seen, last_seen, updated_at)
         VALUES ($accountHash, $rsn, $effect, $active, $now, $now, $now)
         ON CONFLICT (account_hash, effect) DO UPDATE SET
            rsn = excluded.rsn,
            active = excluded.active,
            last_seen = excluded.last_seen,
            updated_at = CASE
                WHEN active != excluded.active
                THEN excluded.updated_at
                ELSE updated_at
            END`,
    ).run({ rsn: rsn ?? "", active, accountHash, effect, now });
}

export function handleStatusEffect(ctx: HandlerCtx): void {
    const { conn, payload, now, envelope, id } = ctx;
    const { accountHash, rsn } = id;
    const effect = typeof payload.effect === "string" ? payload.effect : null;
    if (effect === null) return;
    const incomingActive = payload.active === true || payload.active === 1 ? 1 : 0;
    const prior = readPriorActive(conn, accountHash, effect);
    const where = extractWhere(payload);
    const emitter = buildChangeEmitter(conn, "plugin_status_effects_changes", ["effect", SQL_COLUMNS.QTY_SIGNED]);
    conn.transaction(() => {
        if (prior === null || prior !== incomingActive) {
            const qtySigned = incomingActive === 1 ? 1 : -1;
            emitter.emit({
                id,
                envelope,
                where,
                dedupKind: "status_effect_change",
                dedupParts: [effect, qtySigned],
                specific: [effect, qtySigned],
            });
        }
        upsertStatusEffect({ conn, accountHash, rsn, effect, now, active: incomingActive });
    })();
}

registerPluginEvent({
    eventType: EVENT_STATUS_EFFECT,
    routing: "current-state",
    handler: handleStatusEffect,
    payloadFields: [
        { name: "effect", type: "string" },
        { name: "active", type: "boolean" },
    ],
});
