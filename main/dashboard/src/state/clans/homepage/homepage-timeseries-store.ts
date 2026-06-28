import type { DeltaBatch, RowDelta, SnapshotBaseline } from "@clansocket/realtime";
import { signal, type ReadSignal } from "../../../dom/factory/reactive";
import { createLiveStore, type LiveSource, type LiveStore } from "../../../dom/factory/live-ops";

export interface TimeseriesPoint {
    readonly ts: number;
    readonly v: number;
}

export interface TimeseriesHandle {
    readonly timeseries$: ReadSignal<Map<string, TimeseriesPoint[]>>;
    dispose(): void;
}

interface PointRow extends Record<string, unknown> {
    readonly variable_key: string;
    readonly ts: number;
    readonly v: number;
}

interface Ctx {
    readonly slug: string;
    readonly timeseries$: ReturnType<typeof signal<Map<string, TimeseriesPoint[]>>>;
    closeEsRef: { v: (() => void) | null };
}

const slugCtxs = new Map<string, TimeseriesHandle>();
const KEY_PREFIX = "clan.timeseries.";

function isSnapshotFrame(data: unknown): data is { snapshot: SnapshotBaseline } {
    return data !== null && typeof data === "object" && "snapshot" in data;
}

function isDeltaFrame(data: unknown): data is DeltaBatch {
    return data !== null && typeof data === "object" && "deltas" in data && Array.isArray((data as DeltaBatch).deltas);
}

function specKeyFromVarKey(varKey: string): string | null {
    if (!varKey.startsWith(KEY_PREFIX)) return null;
    const rest = varKey.slice(KEY_PREFIX.length);
    const dot = rest.indexOf(".");
    return dot < 0 ? null : rest.slice(0, dot);
}

function rebuild(liveStore: LiveStore<PointRow>, timeseries$: Ctx["timeseries$"]): void {
    const map = new Map<string, TimeseriesPoint[]>();
    for (const row of liveStore.all()) {
        const specKey = specKeyFromVarKey(row.variable_key);
        if (specKey === null) continue;
        const bucket = map.get(specKey);
        const point: TimeseriesPoint = { ts: Number(row.ts), v: Number(row.v) };
        if (bucket) bucket.push(point);
        else map.set(specKey, [point]);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.ts - b.ts);
    timeseries$.set(map);
}

function normalizeBaseline(base: SnapshotBaseline): SnapshotBaseline {
    return { topic: base.topic, seq: base.seq, rows: base.rows as PointRow[] };
}

function normalizeDelta(batch: DeltaBatch): DeltaBatch {
    return { topic: batch.topic, fromSeq: batch.fromSeq, toSeq: batch.toSeq, deltas: batch.deltas as RowDelta[] };
}

function makeSource(slug: string, ctx: Ctx): LiveSource {
    return {
        subscribe(onSnapshot, onDelta) {
            const url = `/api/clans/${encodeURIComponent(slug)}/timeseries/stream`;
            const es = new EventSource(url, { withCredentials: true });
            es.addEventListener("message", (e: MessageEvent<string>) => {
                let data: unknown;
                try {
                    data = JSON.parse(e.data);
                } catch {
                    return;
                }
                if (isSnapshotFrame(data)) onSnapshot(normalizeBaseline(data.snapshot));
                else if (isDeltaFrame(data)) onDelta(normalizeDelta(data));
            });
            ctx.closeEsRef.v = () => es.close();
            return () => {
                ctx.closeEsRef.v?.();
                ctx.closeEsRef.v = null;
            };
        },
    };
}

function createHandle(slug: string): TimeseriesHandle {
    const ctx: Ctx = {
        slug,
        timeseries$: signal<Map<string, TimeseriesPoint[]>>(new Map()),
        closeEsRef: { v: null },
    };
    const source = makeSource(slug, ctx);
    const liveStore = createLiveStore<PointRow>({
        topic: `clan_timeseries:${slug}`,
        keyOf: (row) => String(row.variable_key),
        source,
    });
    const offChange = liveStore.onChange(() => rebuild(liveStore, ctx.timeseries$));
    liveStore.start();
    return {
        timeseries$: ctx.timeseries$,
        dispose(): void {
            offChange();
            liveStore.teardown();
            slugCtxs.delete(slug);
        },
    };
}

export function ensureTimeseriesStore(slug: string): TimeseriesHandle {
    let handle = slugCtxs.get(slug);
    if (handle === undefined) {
        handle = createHandle(slug);
        slugCtxs.set(slug, handle);
    }
    return handle;
}

export function disposeTimeseriesStore(slug: string): void {
    const handle = slugCtxs.get(slug);
    if (handle !== undefined) handle.dispose();
}
