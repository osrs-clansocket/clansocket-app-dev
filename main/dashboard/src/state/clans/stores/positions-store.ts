import { signal } from "../../../dom/factory/reactive";
import { createLiveStore, type LiveSource } from "../../../dom/factory/live-ops";
import { setRanks } from "../../identity/ranks-registry.js";
import {
    INITIAL_METADATA,
    INITIAL_STATE,
    isDeltaBatch,
    isInitialFrame,
    transformDelta,
    transformSnapshot,
    type InitialFrame,
    type PositionRow,
    type PositionsCtx,
    type PositionsMetadata,
    type PositionsState,
    type PositionsStore,
} from "./positions-store-types.js";
export type {
    PositionRow,
    PositionsMapMeta,
    PositionsMetadata,
    PositionsPlane,
    PositionsState,
    PositionsStore,
} from "./positions-store-types.js";
export { IN_WORLD_LOGIN_STATES, isPositionActive } from "./positions-store-types.js";

function buildQuery(mode?: string): string {
    return mode && mode.length > 0 ? `?mode=${encodeURIComponent(mode)}` : "";
}

function applyInitialFrame(
    ctx: PositionsCtx,
    data: InitialFrame,
    onSnapshot: (s: ReturnType<typeof transformSnapshot>) => void,
): void {
    ctx.cachedMetaRef.v = {
        mode: data.mode,
        availableModes: data.availableModes,
        mapMeta: data.mapMeta,
        planes: data.planes,
    };
    ctx.metadata$.set(ctx.cachedMetaRef.v);
    onSnapshot(transformSnapshot(data.snapshot));
}

function makePositionsSource(args: { slug: string; mode?: string; ctx: PositionsCtx }): LiveSource {
    const { slug, mode, ctx } = args;
    return {
        subscribe(onSnapshot, onDelta) {
            const url = `/api/clans/${encodeURIComponent(slug)}/positions/stream${buildQuery(mode)}`;
            const es = new EventSource(url, { withCredentials: true });
            es.addEventListener("message", (e: MessageEvent<string>): void => {
                let data: unknown;
                try {
                    data = JSON.parse(e.data);
                } catch {
                    return;
                }
                if (isInitialFrame(data)) applyInitialFrame(ctx, data, onSnapshot);
                else if (isDeltaBatch(data)) onDelta(transformDelta(data));
            });
            ctx.closeEsRef.v = () => es.close();
            return () => {
                ctx.closeEsRef.v?.();
                ctx.closeEsRef.v = null;
            };
        },
    };
}

function makeRebuildPositions(args: {
    ctx: PositionsCtx;
    liveStore: ReturnType<typeof createLiveStore<PositionRow>>;
}): () => void {
    const { ctx, liveStore } = args;
    return (): void => {
        const byHash = new Map<string, PositionRow>();
        const ranksUpdate = new Map<string, string | null>();
        for (const row of liveStore.all()) {
            byHash.set(row.account_hash, row);
            ranksUpdate.set(row.latest_rsn, row.clan_rank);
        }
        setRanks(ranksUpdate);
        ctx.positions$.set({
            byHash,
            mode: ctx.cachedMetaRef.v.mode,
            availableModes: ctx.cachedMetaRef.v.availableModes,
            mapMeta: ctx.cachedMetaRef.v.mapMeta,
            planes: ctx.cachedMetaRef.v.planes,
        });
    };
}

export function createPositionsStore(slug: string, mode?: string): PositionsStore {
    const ctx: PositionsCtx = {
        metadata$: signal<PositionsMetadata>(INITIAL_METADATA),
        positions$: signal<PositionsState>(INITIAL_STATE),
        cachedMetaRef: { v: INITIAL_METADATA },
        closeEsRef: { v: null },
    };
    const source = makePositionsSource({ slug, mode, ctx });
    const liveStore = createLiveStore<PositionRow>({
        topic: `positions:${slug}:${mode ?? "default"}`,
        keyOf: (row) => row.account_hash,
        source,
    });
    const offChange = liveStore.onChange(makeRebuildPositions({ ctx, liveStore }));
    liveStore.start();
    return {
        liveStore,
        positions$: ctx.positions$,
        metadata$: ctx.metadata$,
        dispose(): void {
            offChange();
            liveStore.teardown();
        },
    };
}
