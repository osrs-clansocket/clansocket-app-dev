import type { ChangeEmitter } from "./change-inserter.js";
import type { HandlerCtx } from "./handler-ctx.js";
import type { PlayerIdentity, SpatialColumns } from "./projection-utils.js";

export interface PrayerUpsertArgs {
    conn: HandlerCtx["conn"];
    id: PlayerIdentity;
    prayerId: number;
    prayerName: string;
    active: number;
    now: number;
}

export interface PrayerBatchArgs {
    emitter: ChangeEmitter;
    ctx: HandlerCtx;
    where: SpatialColumns;
    priorActive: Map<number, string>;
    incomingActive: Map<number, string>;
    upsert: (args: PrayerUpsertArgs) => void;
}
