import { icon, image, snapshot, TREE_ICON_CLASS, type Instance, type TreeNode } from "../../../factory";
import type { ScopeListItem, ScopeListTable } from "../../../../state/data-rights/data-rights-client/index.js";
import { tableMeta } from "../../../../state/data-rights/table-meta.js";
import { tableIconSpec } from "../../../../state/data-rights/assets/table-meta-icon.js";

const SCOPE_ICONS: Record<string, string> = {
    app: "person-vcard",
    varez: "robot",
    bot: "discord",
    clan: "people-fill",
    clan_audit: "clipboard-check",
    plugin: "puzzle",
    local: "hdd",
};
const FOLDER_FALLBACK_ICON = "folder";

export function scopeKeyFor(s: { kind: string; clanId?: string; mode?: string }): string {
    return [s.kind, s.clanId ?? "", s.mode ?? ""].join(":");
}

export interface LeafRef {
    instance: Instance;
    hasRows: boolean;
}

function normalizeTable(t: ScopeListTable | string): ScopeListTable {
    if (typeof t === "string") return { name: t, hasRows: true };
    return t;
}

function buildLeafIcon(table: string, label: string): Instance {
    const spec = tableIconSpec(table);
    if (spec.kind === "asset") {
        return image({ src: spec.src, alt: label, classes: [TREE_ICON_CLASS], context: null, meta: null });
    }
    return icon({ name: spec.name, classes: [TREE_ICON_CLASS], context: null, meta: null });
}

interface LeafContext {
    scope: ScopeListItem;
    table: ScopeListTable;
    isActive: boolean;
    onPick: (s: ScopeListItem, t: string) => void;
    leafRefs: Map<string, LeafRef>;
}

function leafNodeFor(ctx: LeafContext): TreeNode {
    const meta = tableMeta(ctx.table.name);
    const key = `${scopeKeyFor(ctx.scope)}:${ctx.table.name}`;
    return {
        key,
        kind: "leaf",
        label: snapshot(meta.label),
        icon: buildLeafIcon(ctx.table.name, meta.label),
        isActive: ctx.isActive,
        isEmpty: !ctx.table.hasRows,
        title: ctx.table.name,
        onClick: () => {
            const ref = ctx.leafRefs.get(key);
            if (ref && !ref.hasRows) return;
            ctx.onPick(ctx.scope, ctx.table.name);
        },
        onMount: (inst) => ctx.leafRefs.set(key, { instance: inst, hasRows: ctx.table.hasRows }),
    };
}

interface FolderTableChildren {
    scope: ScopeListItem;
    folderKey: string;
    activeTableKey: string;
    onPick: (scope: ScopeListItem, table: string) => void;
    leafRefs: Map<string, LeafRef>;
}

function folderTableChildren(args: FolderTableChildren): TreeNode[] {
    const { scope, folderKey, activeTableKey, onPick, leafRefs } = args;
    return scope.tables.map((tRaw) => {
        const t = normalizeTable(tRaw);
        return leafNodeFor({
            scope,
            onPick,
            leafRefs,
            table: t,
            isActive: `${folderKey}:${t.name}` === activeTableKey,
        });
    });
}

export interface FolderNodeArgs {
    scope: ScopeListItem;
    isExpanded: boolean;
    activeTableKey: string;
    onPickTable: (scope: ScopeListItem, table: string) => void;
    onToggleFolder: (scopeKey: string) => void;
    leafRefs: Map<string, LeafRef>;
}

export function folderNodeFor(args: FolderNodeArgs): TreeNode {
    const { scope, isExpanded, activeTableKey, onPickTable, onToggleFolder, leafRefs } = args;
    const key = scopeKeyFor(scope);
    return {
        key,
        isExpanded,
        kind: "folder",
        label: scope.label,
        icon: icon({
            name: SCOPE_ICONS[scope.kind] ?? FOLDER_FALLBACK_ICON,
            classes: [TREE_ICON_CLASS],
            context: null,
            meta: null,
        }),
        children: folderTableChildren({ scope, activeTableKey, leafRefs, folderKey: key, onPick: onPickTable }),
        onToggle: () => onToggleFolder(key),
    };
}
