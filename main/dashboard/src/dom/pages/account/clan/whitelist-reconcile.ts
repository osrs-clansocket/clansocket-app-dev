import type { Instance } from "../../../factory";
import type { ManagedClan } from "../../../../state/clans/clans-client/index.js";
import { buildRankEntry, rebuildKeyFor, type RankDataRef, type RankPoolEntry } from "./whitelist-buttons.js";
import { patchRankEntry } from "./whitelist-patch.js";

export interface WhitelistCtx {
    clan: ManagedClan;
    grid: Instance;
    empty: Instance;
    dataRef: RankDataRef;
    entryPool: Map<string, RankPoolEntry>;
    refresh: () => Promise<void>;
}

export function reconcileWhitelistPool(ctx: WhitelistCtx, sortedRanks: string[]): void {
    const live = new Set(sortedRanks);
    for (const r of sortedRanks) {
        const wantKey = rebuildKeyFor(r, ctx.dataRef);
        const cached = ctx.entryPool.get(r);
        if (cached !== undefined && cached.rebuildKey !== wantKey) {
            cached.inst.destroy();
            ctx.entryPool.delete(r);
        }
        if (!ctx.entryPool.has(r)) ctx.entryPool.set(r, buildRankEntry(ctx.clan.slug, r, ctx.dataRef, ctx.refresh));
        patchRankEntry(ctx.entryPool.get(r)!, r, ctx.dataRef);
    }
    for (const [r, entry] of ctx.entryPool) {
        if (!live.has(r)) {
            entry.inst.destroy();
            ctx.entryPool.delete(r);
        }
    }
}

export function reorderWhitelistEntries(ctx: WhitelistCtx, sortedRanks: string[]): void {
    let nextEl: ChildNode | null = ctx.grid.el.firstChild;
    for (const r of sortedRanks) {
        const entry = ctx.entryPool.get(r);
        if (entry === undefined) continue;
        if (entry.inst.el === nextEl) nextEl = nextEl?.nextSibling ?? null;
        else ctx.grid.addBefore(entry.inst, nextEl);
    }
}
