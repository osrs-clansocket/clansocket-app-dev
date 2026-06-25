import type Database from "better-sqlite3";
import type { EventEnvelopeCols } from "../envelope.js";
import type { PlayerIdentity, SpatialColumns } from "../projection-utils.js";

export interface DeathCause {
    causeKind: string;
    causeId: number | null;
    causeName: string | null;
    causeCombatLevel: number | null;
    causeCategory: string | null;
    hpBefore: number | null;
}

export interface RespawnLocation {
    respawnX: number | null;
    respawnY: number | null;
    respawnPlane: number | null;
    respawnRegionId: number | null;
    respawnRegionName: string | null;
    respawnArea: string | null;
}

export interface DeathInsertArgs {
    conn: Database.Database;
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
    cause: DeathCause;
    respawn: RespawnLocation;
    dedup: string;
}
