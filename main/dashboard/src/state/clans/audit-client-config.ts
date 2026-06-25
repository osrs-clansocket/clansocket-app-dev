export const MAX_BATCH = 50;
export const MAX_AGE_MS = 5000;
export const COLLAPSE_MS = 1000;
export const CLAN_PATH_PREFIX = "/clans/";
export const CAUSAL_ACTIONS: ReadonlySet<string> = new Set<string>(["client:click", "client:submit"]);

export interface BufferEntry {
    sessionId: string;
    seq: number;
    ts: number;
    action: string;
    target: string | null;
    meta: Record<string, unknown> | null;
    actor_kind?: "ai";
}

export interface AuditMeta {
    chainId?: string;
    args?: Record<string, unknown>;
    success?: boolean;
    error?: string;
}
