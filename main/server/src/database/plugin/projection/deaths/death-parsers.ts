import { spatialFrom, type Payload, type SpatialColumns } from "../projection-utils.js";
import type { DeathCause, RespawnLocation } from "./death-types.js";

export function flatWhere(payload: Payload): SpatialColumns {
    return spatialFrom(payload as Record<string, unknown>);
}

function readCauseName(payload: Payload, isPlayer: boolean): string | null {
    if (isPlayer) return null;
    return typeof payload.causeName === "string" ? payload.causeName : null;
}

function causeCombatLevel(payload: Payload, isPlayer: boolean, isEnv: boolean): number | null {
    if (isPlayer || isEnv) return null;
    return typeof payload.causeCombatLevel === "number" ? payload.causeCombatLevel : null;
}

export function parseCause(payload: Payload): DeathCause {
    const causeKind = typeof payload.causeKind === "string" ? payload.causeKind : "UNKNOWN";
    const isPlayer = causeKind === "PLAYER";
    const isEnv = causeKind === "ENVIRONMENT";
    return {
        causeKind,
        causeId: typeof payload.causeId === "number" ? payload.causeId : null,
        causeName: readCauseName(payload, isPlayer),
        causeCombatLevel: causeCombatLevel(payload, isPlayer, isEnv),
        causeCategory: typeof payload.causeCategory === "string" ? payload.causeCategory : null,
        hpBefore: typeof payload.hpBefore === "number" ? payload.hpBefore : null,
    };
}

export function parseRespawn(payload: Payload): RespawnLocation {
    return {
        respawnX: typeof payload.respawnX === "number" ? payload.respawnX : null,
        respawnY: typeof payload.respawnY === "number" ? payload.respawnY : null,
        respawnPlane: typeof payload.respawnPlane === "number" ? payload.respawnPlane : null,
        respawnRegionId: typeof payload.respawnRegionId === "number" ? payload.respawnRegionId : null,
        respawnRegionName: typeof payload.respawnRegionName === "string" ? payload.respawnRegionName : null,
        respawnArea: typeof payload.respawnArea === "string" ? payload.respawnArea : null,
    };
}
