import { dataRightsClient } from "../data-rights-client/index.js";
import { scopesStore } from "../stores/scopes-store.js";
import { scopeKeyFor } from "../data-rights-client/scope-key.js";
import type { PageState } from "./types.js";

const STREAM_DEBOUNCE_MS = 250;

export interface HasRowsTarget {
    setTableHasRows(scopeKey: string, table: string, hasRows: boolean): void;
}

export interface WritesStreamCtx {
    state: PageState;
    getTreeTarget: () => HasRowsTarget | null;
    rerenderTree: () => void;
    getLocalScopes: () => PageState["scopes"];
}

function scopeByKey(state: PageState, scopeKey: string): PageState["scopes"][number] | undefined {
    return state.scopes.find((s) => scopeKeyFor(s) === scopeKey);
}

function isInsertLike(kind: string): boolean {
    return kind === "insert" || kind === "replace";
}

function applyRowsChange(ctx: WritesStreamCtx, scopeKey: string, table: string, hasRows: boolean): void {
    const scope = scopeByKey(ctx.state, scopeKey);
    if (!scope) return;
    const entry = scope.tables.find((t) => (typeof t === "string" ? t : t.name) === table);
    if (!entry || typeof entry === "string") return;
    if (entry.hasRows === hasRows) return;
    entry.hasRows = hasRows;
    const tree = ctx.getTreeTarget();
    if (tree) tree.setTableHasRows(scopeKey, table, hasRows);
}

async function refreshScopes(ctx: WritesStreamCtx): Promise<void> {
    await scopesStore.refresh();
    ctx.state.scopes = [...scopesStore.list$(), ...ctx.getLocalScopes()];
    if (ctx.state.scopeItem) {
        const activeKey = scopeKeyFor(ctx.state.scopeItem);
        ctx.state.scopeItem = scopeByKey(ctx.state, activeKey) ?? ctx.state.scopeItem;
    }
    ctx.rerenderTree();
}

export function setupWritesStream(ctx: WritesStreamCtx): () => void {
    let scopesRefreshTimer: number | null = null;
    return dataRightsClient.openWritesStream((event) => {
        if (event.scopeAdded) {
            if (scopesRefreshTimer === null) {
                scopesRefreshTimer = window.setTimeout(() => {
                    scopesRefreshTimer = null;
                    void refreshScopes(ctx);
                }, STREAM_DEBOUNCE_MS);
            }
            return;
        }
        if (isInsertLike(event.kind)) applyRowsChange(ctx, event.scopeKey, event.table, true);
        else if (event.kind === "delete" && event.nowHasRows === false)
            applyRowsChange(ctx, event.scopeKey, event.table, false);
    });
}
