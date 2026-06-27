import type { DeltaBatch, RowDelta, SnapshotBaseline } from "@clansocket/realtime";
import { signal, type ReadSignal } from "../../../dom/factory/reactive";
import { createLiveStore, type LiveSource, type LiveStore } from "../../../dom/factory/live-ops";

export type MetricFormat = "int" | "gp";

export interface MetricValue {
    readonly value: number;
    readonly format: MetricFormat;
}

export interface MetricsHandle {
    readonly metrics$: ReadSignal<Map<string, MetricValue>>;
    dispose(): void;
}

interface MetricRow extends Record<string, unknown> {
    readonly variable_key: string;
    readonly value: number;
    readonly format: MetricFormat;
}

interface Ctx {
    readonly slug: string;
    readonly metrics$: ReturnType<typeof signal<Map<string, MetricValue>>>;
    closeEsRef: { v: (() => void) | null };
}

const slugCtxs = new Map<string, MetricsHandle>();

function isSnapshotFrame(data: unknown): data is { snapshot: SnapshotBaseline } {
    return data !== null && typeof data === "object" && "snapshot" in data;
}

function isDeltaFrame(data: unknown): data is DeltaBatch {
    return data !== null && typeof data === "object" && "deltas" in data && Array.isArray((data as DeltaBatch).deltas);
}

function rebuild(liveStore: LiveStore<MetricRow>, metrics$: Ctx["metrics$"]): void {
    const map = new Map<string, MetricValue>();
    for (const row of liveStore.all()) {
        map.set(row.variable_key, { value: Number(row.value), format: row.format });
    }
    metrics$.set(map);
}

function normalizeBaseline(base: SnapshotBaseline): SnapshotBaseline {
    return { topic: base.topic, seq: base.seq, rows: base.rows as MetricRow[] };
}

function normalizeDelta(batch: DeltaBatch): DeltaBatch {
    return { topic: batch.topic, fromSeq: batch.fromSeq, toSeq: batch.toSeq, deltas: batch.deltas as RowDelta[] };
}

function makeSource(slug: string, ctx: Ctx): LiveSource {
    return {
        subscribe(onSnapshot, onDelta) {
            const url = `/api/clans/${encodeURIComponent(slug)}/metrics/stream`;
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

function createHandle(slug: string): MetricsHandle {
    const ctx: Ctx = {
        slug,
        metrics$: signal<Map<string, MetricValue>>(new Map()),
        closeEsRef: { v: null },
    };
    const source = makeSource(slug, ctx);
    const liveStore = createLiveStore<MetricRow>({
        topic: `clan_metrics:${slug}`,
        keyOf: (row) => String(row.variable_key),
        source,
    });
    const offChange = liveStore.onChange(() => rebuild(liveStore, ctx.metrics$));
    liveStore.start();
    return {
        metrics$: ctx.metrics$,
        dispose(): void {
            offChange();
            liveStore.teardown();
            slugCtxs.delete(slug);
        },
    };
}

export function ensureMetricsStore(slug: string): MetricsHandle {
    let handle = slugCtxs.get(slug);
    if (handle === undefined) {
        handle = createHandle(slug);
        slugCtxs.set(slug, handle);
    }
    return handle;
}

export function disposeMetricsStore(slug: string): void {
    const handle = slugCtxs.get(slug);
    if (handle !== undefined) handle.dispose();
}
