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

export function applyPrayerActivations(args: PrayerBatchArgs): void {
    const { emitter, ctx, where, priorActive, incomingActive, upsert } = args;
    const { conn, now, envelope, id } = ctx;
    for (const [prayerId, prayerName] of incomingActive) {
        if (!priorActive.has(prayerId)) {
            emitPrayerChange({ emitter, id, envelope, where, prayerId, prayerName, qtySigned: 1 });
        }
        upsert({ conn, id, prayerId, prayerName, now, active: 1 });
    }
}

export function applyPrayerDeactivations(args: PrayerBatchArgs): void {
    const { emitter, ctx, where, priorActive, incomingActive, upsert } = args;
    const { conn, now, envelope, id } = ctx;
    for (const [prayerId, prayerName] of priorActive) {
        if (incomingActive.has(prayerId)) continue;
        emitPrayerChange({ emitter, id, envelope, where, prayerId, prayerName, qtySigned: -1 });
        upsert({ conn, id, prayerId, prayerName, now, active: 0 });
    }
}
