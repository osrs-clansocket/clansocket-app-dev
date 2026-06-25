import {
    button,
    div,
    icon,
    image,
    INLINE_CONFIRM_HOST_CLASS,
    inlineConfirm,
    scheduleAttr,
    snapshot,
    span,
    type Instance,
} from "../../../../../factory/index.js";
import { rowSummary } from "../../../../../../state/data-rights/summary.js";
import { resolveColumnAsset } from "../../../../../../state/data-rights/assets/asset-resolver.js";
import { tableMeta } from "../../../../../../state/data-rights/table-meta.js";
import {
    DR_ROW_ASSET_CLASS,
    DR_ROW_ASSET_EMPTY_CLASS,
    DR_ROW_BUTTON_CLASS,
    DR_ROW_DELETE_CLASS,
    DR_ROW_META_CLASS,
    DR_ROW_PRIMARY_CLASS,
    DR_ROW_SECONDARY_CLASS,
} from "../../../../../../shared/constants/rights-constants.js";

const EMPTY_SRC = "";

function confirmRowDelete(host: Instance, table: string): Promise<boolean> {
    return inlineConfirm(host, {
        cancelLabel: "Keep",
        confirmLabel: "Delete",
        danger: true,
        cancelContext: `keep this row in ${table}`,
        confirmContext: `confirm deleting this row from ${table}`,
    });
}

export function liveDeleteButton(key: string, table: string, onDelete: (key: string) => void): Instance {
    const host = div({ classes: [INLINE_CONFIRM_HOST_CLASS], context: null, meta: null });
    const btn = button(
        {
            classes: [DR_ROW_DELETE_CLASS],
            ariaLabel: "Delete row",
            title: "Delete row",
            type: "button",
            context: "delete this row",
            meta: ["destructive", "data"],
            onClick: async (e) => {
                e.stopPropagation();
                const ok = await confirmRowDelete(host, table);
                if (ok) onDelete(key);
            },
        },
        [icon({ name: "trash", context: null, meta: null })],
    );
    host.addChild(btn);
    return host;
}

export function resolvePrimaryAsset(table: string, row: Record<string, unknown>): string | null {
    const meta = tableMeta(table);
    if (meta.summary) {
        for (const c of [meta.summary.primary, meta.summary.secondary, meta.summary.updated]) {
            if (!c) continue;
            const asset = resolveColumnAsset(table, c, row[c], row);
            if (asset !== null) return asset;
        }
    }
    for (const c of Object.keys(row)) {
        const asset = resolveColumnAsset(table, c, row[c], row);
        if (asset !== null) return asset;
    }
    return null;
}

export function applyAsset(el: HTMLImageElement, src: string | null): void {
    if (src === null) {
        scheduleAttr(el, "src", null);
        el.classList.add(DR_ROW_ASSET_EMPTY_CLASS);
        return;
    }
    if (el.getAttribute("src") !== src) el.src = src;
    el.classList.remove(DR_ROW_ASSET_EMPTY_CLASS);
}

export interface SummaryParts {
    primary: Instance;
    secondary: Instance | null;
    meta: Instance | null;
    assetInst: Instance<HTMLImageElement>;
}

export function buildSummaryParts(
    row: Record<string, unknown>,
    table: string,
    sum: ReturnType<typeof rowSummary>,
): SummaryParts {
    const initialAsset = resolvePrimaryAsset(table, row);
    const assetInst = image({
        src: initialAsset ?? EMPTY_SRC,
        alt: snapshot(sum.primary),
        classes: [DR_ROW_ASSET_CLASS],
        lazy: true,
        context: null,
        meta: null,
    });
    if (initialAsset === null) assetInst.toggleClass(DR_ROW_ASSET_EMPTY_CLASS, true);
    const primary = span({ classes: [DR_ROW_PRIMARY_CLASS], text: snapshot(sum.primary), context: null, meta: null });
    const secondary = sum.secondary
        ? span({ classes: [DR_ROW_SECONDARY_CLASS], text: snapshot(sum.secondary), context: null, meta: null })
        : null;
    const meta = sum.meta
        ? span({ classes: [DR_ROW_META_CLASS], text: snapshot(sum.meta), context: null, meta: null })
        : null;
    return { primary, secondary, meta, assetInst };
}

export function buildRowButton(
    sum: ReturnType<typeof rowSummary>,
    parts: SummaryParts,
    key: string,
    onSelect: (key: string) => void,
): Instance {
    const buttonChildren: Instance[] = [parts.assetInst, parts.primary];
    if (parts.secondary) buttonChildren.push(parts.secondary);
    if (parts.meta) buttonChildren.push(parts.meta);
    return button(
        {
            ariaLabel: sum.primary,
            classes: [DR_ROW_BUTTON_CLASS],
            type: "button",
            context: "open this row's details",
            meta: ["action", "data"],
            onClick: () => onSelect(key),
        },
        buttonChildren,
    );
}
