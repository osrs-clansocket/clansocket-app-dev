import type Database from "better-sqlite3";
import type { EventEnvelopeCols } from "./envelope.js";
import type { Payload, PlayerIdentity } from "./projection-utils.js";

export interface HandlerCtx {
    conn: Database.Database;
    id: PlayerIdentity;
    payload: Payload;
    now: number;
    envelope: EventEnvelopeCols;
}
