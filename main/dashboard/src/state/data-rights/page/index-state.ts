import { scopeToScope } from "../data-rights-client/scope-key.js";
import { getLocalScopes } from "../local-source.js";
import { scopesStore } from "../stores/scopes-store.js";
import { readUrl } from "../page-state/url.js";
import type { PageState } from "../page-state/types.js";
import { scopeKeyFor } from "../../../dom/pages/routes/data-rights/tree";

const MOBILE_BREAKPOINT_REM = 40;

export function isMobile(): boolean {
    return window.matchMedia(`(width<=${MOBILE_BREAKPOINT_REM}rem)`).matches;
}

export interface RenderOpts {
    clanFilter?: string;
    embedded?: boolean;
}

function tableName(entry: string | { name: string; hasRows: boolean }): string {
    return typeof entry === "string" ? entry : entry.name;
}

function pickInitialTable(initialScope: PageState["scopeItem"], fromUrlTable: string | null): string | null {
    const firstHasRows = initialScope?.tables.find((t) => (typeof t === "string" ? true : t.hasRows));
    const firstName = firstHasRows ? tableName(firstHasRows) : null;
    return fromUrlTable ?? firstName ?? null;
}

function initExpanded(
    initialScope: PageState["scopeItem"],
    firstScope: PageState["scopes"][number] | undefined,
): Set<string> {
    const expanded = new Set<string>();
    if (initialScope) expanded.add(scopeKeyFor(initialScope));
    else if (firstScope) expanded.add(scopeKeyFor(firstScope));
    return expanded;
}

function pickInitialView(initialTable: string | null): "list" | "tree" {
    if (initialTable === null) return "tree";
    return isMobile() ? "list" : "tree";
}

export function makePageState(scopes: PageState["scopes"], fromUrl: ReturnType<typeof readUrl>): PageState {
    const initialScope = fromUrl.scope;
    const initialTable = pickInitialTable(initialScope, fromUrl.table);
    return {
        scopes,
        rows: [],
        info: null,
        selectedIndex: -1,
        rsn: null,
        offset: 0,
        loadingMore: false,
        hasMore: false,
        scope: initialScope ? scopeToScope(initialScope) : null,
        scopeItem: initialScope,
        table: initialTable,
        expanded: initExpanded(initialScope, scopes[0]),
        from: fromUrl.from,
        to: fromUrl.to,
        view: pickInitialView(initialTable),
    };
}

export function applyTablePick(state: PageState, scopeItem: NonNullable<PageState["scopeItem"]>, table: string): void {
    state.scopeItem = scopeItem;
    state.scope = scopeToScope(scopeItem);
    state.table = table;
    state.from = null;
    state.to = null;
    state.rsn = null;
    state.view = isMobile() ? "list" : "tree";
}

export function filterScopes(opts: RenderOpts): typeof scopesStore.list$ extends () => infer S ? S : never {
    let scopes = [...scopesStore.list$(), ...getLocalScopes()];
    if (opts.clanFilter !== undefined) {
        const slug = opts.clanFilter;
        scopes = scopes.filter((s) => s.clanSlug === slug);
    }
    return scopes as unknown as ReturnType<typeof scopesStore.list$>;
}
