import type { DeltaBatch, SnapshotBaseline } from "@clansocket/realtime";
import type { WritesStreamEvent } from "../types.js";

interface BaseRecord {
    readonly id: string;
}

export interface ProjectionRecord extends BaseRecord {
    readonly kind: "projection";
    readonly topic: string;
    readonly params: Record<string, string | number | undefined>;
    readonly onSnapshot: (base: SnapshotBaseline) => void;
    readonly onDelta: (batch: DeltaBatch) => void;
}

export interface WritesRecord extends BaseRecord {
    readonly kind: "writes";
    readonly handlers: Set<(event: WritesStreamEvent) => void>;
}

export interface IdentificationRecord extends BaseRecord {
    readonly kind: "identification";
    readonly handlers: Set<() => void>;
}

export type MuxRecord = ProjectionRecord | WritesRecord | IdentificationRecord;

export function buildUrl(records: ReadonlyMap<string, MuxRecord>): string {
    const subs = [...records.values()].map((r) => {
        if (r.kind === "projection") return { id: r.id, kind: r.kind, topic: r.topic, params: r.params };
        return { id: r.id, kind: r.kind };
    });
    return `/api/data-rights/me/stream?subs=${encodeURIComponent(JSON.stringify(subs))}`;
}

export function parseRecordHit(
    e: MessageEvent<string>,
    records: ReadonlyMap<string, MuxRecord>,
): { rec: MuxRecord; payload: unknown } | null {
    let msg: unknown;
    try {
        msg = JSON.parse(e.data);
    } catch {
        return null;
    }
    if (!msg || typeof msg !== "object") return null;
    const m = msg as { id?: unknown; payload?: unknown };
    if (typeof m.id !== "string") return null;
    const rec = records.get(m.id);
    if (!rec) return null;
    return { rec, payload: m.payload };
}

export function dispatchProjection(rec: ProjectionRecord, payload: unknown): void {
    const p = payload as { snapshot?: SnapshotBaseline; batch?: DeltaBatch };
    if (p.snapshot) rec.onSnapshot(p.snapshot);
    else if (p.batch) rec.onDelta(p.batch);
}
