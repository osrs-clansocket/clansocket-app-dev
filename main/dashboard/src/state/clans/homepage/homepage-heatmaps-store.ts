import type { DeltaBatch, RowDelta, SnapshotBaseline } from "@clansocket/realtime";
import { signal, type ReadSignal } from "../../../dom/factory/reactive";
import { createLiveStore, type LiveSource, type LiveStore } from "../../../dom/factory/live-ops";

export interface HeatmapCell {
    readonly x: string;
    readonly y: string;
    readonly v: number;
}

export interface HeatmapsHandle {
    readonly heatmaps$: ReadSignal<Map<string, HeatmapCell[]>>;
    dispose(): void;
}

interface CellRow extends Record<string, unknown> {
    readonly variable_key: string;
    readonly x: string;
    readonly y: string;
    readonly v: number;
}

interface Ctx {
    readonly slug: string;
    readonly heatmaps$: ReturnType<typeof signal<Map<string, HeatmapCell[]>>>;
    closeEsRef: { v: (() => void) | null };
}

const slugCtxs = new Map<string, HeatmapsHandle>();
const KEY_PREFIX = "clan.heatmap.";

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

function rebuild(liveStore: LiveStore<CellRow>, heatmaps$: Ctx["heatmaps$"]): void {
    const map = new Map<string, HeatmapCell[]>();
    for (const row of liveStore.all()) {
        const specKey = specKeyFromVarKey(row.variable_key);
        if (specKey === null) continue;
        const bucket = map.get(specKey);
        const cell: HeatmapCell = { x: row.x, y: row.y, v: Number(row.v) };
        if (bucket) bucket.push(cell);
        else map.set(specKey, [cell]);
    }
    heatmaps$.set(map);
}

function normalizeBaseline(base: SnapshotBaseline): SnapshotBaseline {
    return { topic: base.topic, seq: base.seq, rows: base.rows as CellRow[] };
}

function normalizeDelta(batch: DeltaBatch): DeltaBatch {
    return { topic: batch.topic, fromSeq: batch.fromSeq, toSeq: batch.toSeq, deltas: batch.deltas as RowDelta[] };
}

function makeSource(slug: string, ctx: Ctx): LiveSource {
    return {
        subscribe(onSnapshot, onDelta) {
            const url = `/api/clans/${encodeURIComponent(slug)}/heatmaps/stream`;
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

function createHandle(slug: string): HeatmapsHandle {
    const ctx: Ctx = {
        slug,
        heatmaps$: signal<Map<string, HeatmapCell[]>>(new Map()),
        closeEsRef: { v: null },
    };
    const source = makeSource(slug, ctx);
    const liveStore = createLiveStore<CellRow>({
        topic: `clan_heatmaps:${slug}`,
        keyOf: (row) => String(row.variable_key),
        source,
    });
    const offChange = liveStore.onChange(() => rebuild(liveStore, ctx.heatmaps$));
    liveStore.start();
    return {
        heatmaps$: ctx.heatmaps$,
        dispose(): void {
            offChange();
            liveStore.teardown();
            slugCtxs.delete(slug);
        },
    };
}

export function ensureHeatmapsStore(slug: string): HeatmapsHandle {
    let handle = slugCtxs.get(slug);
    if (handle === undefined) {
        handle = createHandle(slug);
        slugCtxs.set(slug, handle);
    }
    return handle;
}

export function disposeHeatmapsStore(slug: string): void {
    const handle = slugCtxs.get(slug);
    if (handle !== undefined) handle.dispose();
}
