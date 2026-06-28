import type Database from "better-sqlite3";
import { SQL_COLUMNS } from "../../core/sql-columns.js";
import { buildChangeEmitter } from "./change-inserter.js";
import type { HandlerCtx } from "./handler-ctx.js";
import { applyPrayerToggles } from "./dispatcher-prayer.js";
import { extractWhere, type PlayerIdentity } from "./projection-utils.js";
import { EVENT_PRAYERS } from "../../../plugin-api/event-types.js";
import { registerPluginEvent } from "../../../flows/registries/plugin-event-registry.js";

interface PrayerEntry {
    id: number;
    name?: string;
}

interface PriorPrayerRow {
    prayer_id: number;
    prayer_name: string;
    active: number;
}

export function clearActivePrayers(conn: Database.Database, accountHash: string, now: number): void {
    conn.prepare("UPDATE plugin_prayers SET active = 0, updated_at = ? WHERE account_hash = ? AND active = 1").run(
        now,
        accountHash,
    );
}

function priorPrayers(conn: Database.Database, accountHash: string): Map<number, string> {
    const rows = conn
        .prepare("SELECT prayer_id, prayer_name, active FROM plugin_prayers WHERE account_hash = ? AND active = 1")
        .all(accountHash) as PriorPrayerRow[];
    return new Map(rows.map((r) => [r.prayer_id, r.prayer_name]));
}

interface UpsertPrayerArgs {
    conn: Database.Database;
    id: PlayerIdentity;
    prayerId: number;
    prayerName: string;
    active: number;
    now: number;
}

function upsertPrayer(args: UpsertPrayerArgs): void {
    const { conn, id, prayerId, prayerName, active, now } = args;
    conn.prepare(
        `INSERT INTO plugin_prayers (account_hash, rsn, prayer_id, prayer_name, active, first_seen, last_seen, updated_at)
         VALUES ($accountHash, $rsn, $prayerId, $prayerName, $active, $now, $now, $now)
         ON CONFLICT (account_hash, prayer_id) DO UPDATE SET
            rsn = excluded.rsn,
            prayer_name = excluded.prayer_name,
            active = excluded.active,
            last_seen = excluded.last_seen,
            updated_at = CASE
                WHEN active != excluded.active OR prayer_name != excluded.prayer_name
                THEN excluded.updated_at
                ELSE updated_at
            END`,
    ).run({ rsn: id.rsn ?? "", accountHash: id.accountHash, prayerId, prayerName, active, now });
}

export function handlePrayers(ctx: HandlerCtx): void {
    const { conn, payload, id } = ctx;
    const active: PrayerEntry[] = Array.isArray(payload.active) ? payload.active : [];
    const where = extractWhere(payload);
    const emitter = buildChangeEmitter(conn, "plugin_prayers_changes", [
        "prayer_id",
        "prayer_name",
        SQL_COLUMNS.QTY_SIGNED,
    ]);
    conn.transaction(() => {
        const priorActive = priorPrayers(conn, id.accountHash);
        const incomingActive = new Map<number, string>();
        for (const p of active) {
            if (typeof p.id !== "number") continue;
            incomingActive.set(p.id, typeof p.name === "string" ? p.name : "");
        }
        const toggleArgs = { emitter, ctx, where, priorActive, incomingActive, upsert: upsertPrayer };
        applyPrayerToggles(toggleArgs, "on");
        applyPrayerToggles(toggleArgs, "off");
    })();
}

registerPluginEvent({
    eventType: EVENT_PRAYERS,
    routing: "current-state",
    handler: handlePrayers,
    payloadFields: [
        { name: "hash", type: "string" },
        { name: "active", type: "string" },
    ],
});
