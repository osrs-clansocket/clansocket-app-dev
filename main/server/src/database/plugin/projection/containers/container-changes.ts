import type Database from "better-sqlite3";
import type { ChangeEmitter } from "../change-inserter.js";
import { buildChangeEmitter } from "../change-inserter.js";
import type { EventEnvelopeCols } from "../envelope.js";
import type { PlayerIdentity, SpatialColumns } from "../projection-utils.js";
import type { ContainerCause, ContainerItem } from "./container-types.js";
import { isLiveChange } from "./container-formatter.js";
import { CONTAINER_CONFIGS } from "./container-configs.js";

export interface ContainerChangeCtx {
    emitter: ChangeEmitter;
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
}

export interface DispatchDeltaArgs {
    conn: Database.Database;
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
    changes: ContainerItem[];
    cause: ContainerCause;
    containerLabel: string;
}

export function dispatchContainerDelta(args: DispatchDeltaArgs): void {
    const { conn, id, envelope, where, changes, cause, containerLabel } = args;
    const config = CONTAINER_CONFIGS[containerLabel];
    if (!config) return;
    const ctx: ContainerChangeCtx = {
        emitter: buildChangeEmitter(conn, config.table, config.cols),
        id,
        envelope,
        where,
    };
    conn.transaction(() => {
        for (const c of changes) {
            if (isLiveChange(c)) config.build(ctx, c, cause);
        }
    })();
}
