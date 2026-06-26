import type { ChangeEmitter } from "../change-inserter.js";
import type { EventEnvelopeCols } from "../envelope.js";
import type { PlayerIdentity, SpatialColumns } from "../projection-utils.js";

export interface ContainerChangeCtx {
    emitter: ChangeEmitter;
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
}
