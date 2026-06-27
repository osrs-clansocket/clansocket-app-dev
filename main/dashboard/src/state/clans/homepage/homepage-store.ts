import type { DeltaBatch, RowDelta, SnapshotBaseline } from "@clansocket/realtime";
import { signal, type ReadSignal } from "../../../dom/factory/reactive";
import { createLiveStore, type LiveSource, type LiveStore } from "../../../dom/factory/live-ops";
import { isAllowedComponentKind } from "@clansocket/constants/clan-homepage-tokens";
import type { HomepageComponent, HomepageComponentKind } from "./types.js";

export interface HomepageRow extends Record<string, unknown> {
    readonly component_id: string;
}

export interface HomepageStoreHandle {
    readonly liveStore: LiveStore<HomepageRow>;
    readonly components$: ReadSignal<HomepageComponent[]>;
    refresh(): void;
    applyOptimistic(components: readonly HomepageComponent[]): void;
    dispose(): void;
}

interface Ctx {
    readonly slug: string;
    readonly components$: ReturnType<typeof signal<HomepageComponent[]>>;
    closeEsRef: { v: (() => void) | null };
}

const slugCtxs = new Map<string, HomepageStoreHandle>();

function parseJsonObject(raw: unknown): Record<string, unknown> {
    if (typeof raw !== "string") return {};
    try {
        const v = JSON.parse(raw);
        return v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
    } catch {
        return {};
    }
}

function parseStringMap(raw: unknown): Record<string, string> {
    const obj = parseJsonObject(raw);
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string") out[k] = v;
    }
    return out;
}

function rowToComponent(row: HomepageRow): HomepageComponent | null {
    const name = typeof row.component_name === "string" ? row.component_name : "";
    if (!isAllowedComponentKind(name)) return null;
    const payload = parseJsonObject(row.payload_json);
    return {
        componentId: String(row.component_id),
        componentName: name as HomepageComponentKind,
        canvasX: Number(row.canvas_x ?? 0),
        canvasY: Number(row.canvas_y ?? 0),
        canvasW: Number(row.canvas_w ?? 0),
        canvasH: Number(row.canvas_h ?? 0),
        zIndex: Number(row.z_index ?? 0),
        payload: {
            text: typeof payload.text === "string" ? payload.text : undefined,
            imageKey: typeof payload.imageKey === "string" ? payload.imageKey : undefined,
            imageVersion: typeof payload.imageVersion === "number" ? payload.imageVersion : undefined,
        },
        tokenOverrides: parseStringMap(row.token_overrides_json),
        parentId: typeof row.parent_id === "string" ? row.parent_id : null,
    };
}

function rebuild(liveStore: LiveStore<HomepageRow>, components$: Ctx["components$"]): void {
    const rows = liveStore.all();
    const out: HomepageComponent[] = [];
    for (const row of rows) {
        const c = rowToComponent(row);
        if (c !== null) out.push(c);
    }
    out.sort((a, b) => a.zIndex - b.zIndex || a.componentId.localeCompare(b.componentId));
    components$.set(out);
}

function isSnapshotFrame(data: unknown): data is { snapshot: SnapshotBaseline } {
    return data !== null && typeof data === "object" && "snapshot" in data;
}

function isDeltaFrame(data: unknown): data is DeltaBatch {
    return data !== null && typeof data === "object" && "deltas" in data && Array.isArray((data as DeltaBatch).deltas);
}

function normalizeBaseline(base: SnapshotBaseline): SnapshotBaseline {
    return { topic: base.topic, seq: base.seq, rows: base.rows as HomepageRow[] };
}

function normalizeDelta(batch: DeltaBatch): DeltaBatch {
    return { topic: batch.topic, fromSeq: batch.fromSeq, toSeq: batch.toSeq, deltas: batch.deltas as RowDelta[] };
}

function makeSource(slug: string, ctx: Ctx): LiveSource {
    return {
        subscribe(onSnapshot, onDelta) {
            const url = `/api/clans/${encodeURIComponent(slug)}/homepage/stream`;
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

function createHandle(slug: string): HomepageStoreHandle {
    const ctx: Ctx = {
        slug,
        components$: signal<HomepageComponent[]>([]),
        closeEsRef: { v: null },
    };
    const source = makeSource(slug, ctx);
    const liveStore = createLiveStore<HomepageRow>({
        topic: `clan_homepage:${slug}`,
        keyOf: (row) => String(row.component_id),
        source,
    });
    const offChange = liveStore.onChange(() => rebuild(liveStore, ctx.components$));
    liveStore.start();
    return {
        liveStore,
        components$: ctx.components$,
        refresh(): void {
            rebuild(liveStore, ctx.components$);
        },
        applyOptimistic(components: readonly HomepageComponent[]): void {
            const next = [...components].sort(
                (a, b) => a.zIndex - b.zIndex || a.componentId.localeCompare(b.componentId),
            );
            ctx.components$.set(next);
        },
        dispose(): void {
            offChange();
            liveStore.teardown();
            slugCtxs.delete(slug);
        },
    };
}

export function ensureHomepageStore(slug: string): HomepageStoreHandle {
    let handle = slugCtxs.get(slug);
    if (handle === undefined) {
        handle = createHandle(slug);
        slugCtxs.set(slug, handle);
    }
    return handle;
}

export function disposeHomepageStore(slug: string): void {
    const handle = slugCtxs.get(slug);
    if (handle !== undefined) handle.dispose();
}
