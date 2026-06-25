import type Database from "better-sqlite3";
import type { EventEnvelopeCols } from "./envelope.js";
import { rowDedupHash } from "./envelope.js";
import type { PlayerIdentity, SpatialColumns } from "./projection-utils.js";
import { buildInsertSql } from "./build-insert-sql.js";

export type ChangeRowVal = string | number | null;

export interface ChangeEmitArgs {
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
    dedupKind: string;
    dedupParts: ChangeRowVal[];
    specific: ChangeRowVal[];
}

export interface ChangeEmitter {
    emit(args: ChangeEmitArgs): void;
}

interface DedupArgs {
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
    dedupKind: string;
    dedupParts: ChangeRowVal[];
}

function dedupFor(args: DedupArgs): string {
    const { id, envelope, where, dedupKind, dedupParts } = args;
    return rowDedupHash(
        id.accountHash,
        dedupKind,
        ...dedupParts,
        envelope.session_seq,
        where.world ?? 0,
        where.x ?? 0,
        where.y ?? 0,
        where.plane ?? 0,
    );
}

interface RunRowArgs {
    stmt: Database.Statement;
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
    specific: ChangeRowVal[];
    dedup: string;
}

function runRow(args: RunRowArgs): void {
    const { stmt, id, envelope, where, specific, dedup } = args;
    stmt.run(
        id.accountHash,
        id.rsn ?? "",
        envelope.session_id,
        envelope.session_seq,
        envelope.event_received_at,
        envelope.plugin_version,
        ...specific,
        where.world ?? 0,
        where.x ?? 0,
        where.y ?? 0,
        where.plane ?? 0,
        where.region_id ?? 0,
        where.region_name ?? "",
        where.area,
        dedup,
    );
}

function emitOne(stmt: Database.Statement, args: ChangeEmitArgs): void {
    const dedup = dedupFor({
        id: args.id,
        envelope: args.envelope,
        where: args.where,
        dedupKind: args.dedupKind,
        dedupParts: args.dedupParts,
    });
    runRow({ stmt, dedup, id: args.id, envelope: args.envelope, where: args.where, specific: args.specific });
}

export function buildChangeEmitter(
    conn: Database.Database,
    table: string,
    specificCols: readonly string[],
): ChangeEmitter {
    const stmt = conn.prepare(buildInsertSql(table, specificCols));
    return { emit: (args) => emitOne(stmt, args) };
}
