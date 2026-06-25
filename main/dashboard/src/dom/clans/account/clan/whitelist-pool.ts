import type { createWhitelistStore } from "../../../../state/clans/stores/whitelist-store.js";
import { computeSortedRanks } from "./whitelist-sort.js";
import { reconcileWhitelistPool, reorderWhitelistEntries, type WhitelistCtx } from "./whitelist-reconcile.js";

export type { WhitelistCtx } from "./whitelist-reconcile.js";

export function applyWhitelistEffect(ctx: WhitelistCtx, store: ReturnType<typeof createWhitelistStore>): void {
    const data = store.data$();
    const members = data.summary?.roster?.members ?? [];
    const next = new Map<string, string>();
    for (const e of data.entries) next.set(e.value, e.id);
    ctx.dataRef.activeByRank = next;
    if (members.length === 0) {
        for (const entry of ctx.entryPool.values()) entry.inst.destroy();
        ctx.entryPool.clear();
        ctx.empty.el.hidden = false;
        return;
    }
    const sortedRanks = computeSortedRanks(data, ctx.dataRef);
    reconcileWhitelistPool(ctx, sortedRanks);
    reorderWhitelistEntries(ctx, sortedRanks);
    ctx.empty.el.hidden = sortedRanks.length > 0;
}
