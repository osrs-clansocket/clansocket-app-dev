import type { ChangeEmitter } from "./change-inserter.js";
import type { EventEnvelopeCols } from "./envelope.js";
import type { PlayerIdentity, SpatialColumns } from "./projection-utils.js";
import type { PrayerBatchArgs } from "./prayer-toggle.js";

export type { PrayerUpsertArgs, PrayerBatchArgs } from "./prayer-toggle.js";

interface PrayerChangeArgs {
    emitter: ChangeEmitter;
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
    prayerId: number;
    prayerName: string;
    qtySigned: number;
}

export function emitPrayerChange(args: PrayerChangeArgs): void {
    const { emitter, id, envelope, where, prayerId, prayerName, qtySigned } = args;
    emitter.emit({
        id,
        envelope,
        where,
        dedupKind: "prayer_change",
        dedupParts: [prayerId, qtySigned],
        specific: [prayerId, prayerName, qtySigned],
    });
}

export function applyPrayerToggles(args: PrayerBatchArgs, direction: "on" | "off"): void {
    const { emitter, ctx, where, priorActive, incomingActive, upsert } = args;
    const { conn, now, envelope, id } = ctx;
    const source = direction === "on" ? incomingActive : priorActive;
    const skip = direction === "on" ? priorActive : incomingActive;
    const qtySigned = direction === "on" ? 1 : -1;
    const active = direction === "on" ? 1 : 0;
    for (const [prayerId, prayerName] of source) {
        if (skip.has(prayerId)) continue;
        emitPrayerChange({ emitter, id, envelope, where, prayerId, prayerName, qtySigned });
        upsert({ conn, id, prayerId, prayerName, now, active });
    }
}
