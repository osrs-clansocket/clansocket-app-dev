import type { DeltaBatch, SnapshotBaseline } from "@clansocket/realtime";
import type { ReadSignal, Signal } from "../../../dom/factory/reactive";
import type { LiveStore } from "../../../dom/factory/live-ops";

export interface PositionRow extends Record<string, unknown> {
    account_hash: string;
    latest_rsn: string;
    world: number | null;
    activity: string | null;
    login_state: string | null;
    clan_rank: string | null;
    location_x: number;
    location_y: number;
    location_plane: number;
    location_region_id: number;
    location_region_name: string;
    interacting_kind: string | null;
    interacting_id: number | null;
    interacting_name: string | null;
    hitpoints: number;
    max_hitpoints: number;
    prayer: number;
    max_prayer: number;
    last_seen_in_game: number | null;
    last_damage_dealt_target_kind: string | null;
    last_damage_dealt_target_name: string | null;
    last_damage_dealt_amount: number | null;
    last_damage_dealt_at: number | null;
    last_damage_taken_source_kind: string | null;
    last_damage_taken_source_name: string | null;
    last_damage_taken_amount: number | null;
    last_damage_taken_at: number | null;
    active_prayers: readonly string[];
}

export interface PositionsMapMeta {
    width: number;
    height: number;
    tiles_per_region: number;
    pixels_per_tile: number;
    region_px: number;
    origin_world_x: number;
    top_world_y: number;
    region_count: number;
}

export interface PositionsPlane {
    plane: number;
    image: string;
    tiles_dir: string | null;
    region_count: number;
}

export interface PositionsMetadata {
    mode: string | null;
    availableModes: readonly string[];
    mapMeta: PositionsMapMeta | null;
    planes: readonly PositionsPlane[];
}

export interface PositionsState {
    byHash: Map<string, PositionRow>;
    mode: string | null;
    availableModes: readonly string[];
    mapMeta: PositionsMapMeta | null;
    planes: readonly PositionsPlane[];
}

export interface PositionsStore {
    liveStore: LiveStore<PositionRow>;
    positions$: ReadSignal<PositionsState>;
    metadata$: ReadSignal<PositionsMetadata>;
    dispose(): void;
}

export interface InitialFrame {
    snapshot: SnapshotBaseline;
    mode: string | null;
    availableModes: string[];
    mapMeta: PositionsMapMeta | null;
    planes: PositionsPlane[];
}

export interface PositionsCtx {
    metadata$: Signal<PositionsMetadata>;
    positions$: Signal<PositionsState>;
    cachedMetaRef: { v: PositionsMetadata };
    closeEsRef: { v: (() => void) | null };
}

export const IN_WORLD_LOGIN_STATES: ReadonlySet<string> = new Set([
    "LOGGED_IN",
    "LOADING",
    "HOPPING",
    "CONNECTION_LOST",
]);

export function isPositionActive(row: PositionRow): boolean {
    if (row.login_state === null) return false;
    return IN_WORLD_LOGIN_STATES.has(row.login_state);
}

export const INITIAL_METADATA: PositionsMetadata = { mode: null, availableModes: [], mapMeta: null, planes: [] };
export const INITIAL_STATE: PositionsState = { byHash: new Map(), ...INITIAL_METADATA };

function parseActivePrayers(json: unknown): readonly string[] {
    if (typeof json !== "string" || json.length === 0) return [];
    try {
        const parsed: unknown = JSON.parse(json);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((v): v is string => typeof v === "string");
    } catch {
        return [];
    }
}

function transformRow(raw: Record<string, unknown>): PositionRow {
    return { ...raw, active_prayers: parseActivePrayers(raw.active_prayers) } as unknown as PositionRow;
}

export function transformSnapshot(base: SnapshotBaseline): SnapshotBaseline {
    return {
        topic: base.topic,
        seq: base.seq,
        rows: base.rows.map((r) => transformRow(r) as unknown as Record<string, unknown>),
    };
}

export function transformDelta(batch: DeltaBatch): DeltaBatch {
    const deltas = batch.deltas.map((d) => {
        if (d.row === null) return d;
        return { ...d, row: transformRow(d.row) as unknown as Record<string, unknown> };
    });
    return { topic: batch.topic, fromSeq: batch.fromSeq, toSeq: batch.toSeq, deltas };
}

export function isInitialFrame(data: unknown): data is InitialFrame {
    return typeof data === "object" && data !== null && "snapshot" in data;
}

export function isDeltaBatch(data: unknown): data is DeltaBatch {
    return typeof data === "object" && data !== null && "deltas" in data;
}
