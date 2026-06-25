import { div, heading, paragraph, span, type Instance, type LiveChange, type LiveStore } from "../../factory";
import { isPositionActive, type PositionRow } from "../../../state/clans/stores/positions-store.js";
import type { ClanMapApi } from "../../clans/clan-map/index.js";
import {
    CLAN_MAP_EMPTY_CLASS,
    CLAN_MAP_LABEL_LIST_CLASS,
    CLAN_MAP_SIDE_CLASS,
    CLAN_MAP_SIDE_COUNT_CLASS,
    CLAN_MAP_SIDE_EMPTY_CLASS,
    CLAN_MAP_SIDE_HEADER_CLASS,
    CLAN_MAP_SIDE_SECTION_CLASS,
    CLAN_MAP_SIDE_TITLE_CLASS,
} from "../../../shared/constants/clan/clan-map-constants.js";
import { buildRowShell, type RowHandlers, type RowRefs } from "./render-map-row.js";
import { patchRow } from "./clan-map-patch.js";

function placeRows(host: Instance, refs: readonly RowRefs[]): void {
    let nextEl: ChildNode | null = host.el.firstChild;
    for (const ref of refs) {
        if (ref.instance.el === nextEl) {
            nextEl = nextEl?.nextSibling ?? null;
        } else {
            host.addBefore(ref.instance, nextEl);
        }
    }
}

function buildAwaitingMsg(): Instance {
    return paragraph({ classes: [CLAN_MAP_EMPTY_CLASS], text: "Awaiting positions…", context: null, meta: null });
}

function buildSection(title: string): {
    section: Instance;
    countSpan: Instance;
    titleInst: Instance;
    labelList: Instance;
} {
    const titleInst = heading("h2", { classes: [CLAN_MAP_SIDE_TITLE_CLASS], text: title, context: null, meta: null });
    const countSpan = span({ classes: [CLAN_MAP_SIDE_COUNT_CLASS], context: null, meta: null });
    const header = div({ classes: [CLAN_MAP_SIDE_HEADER_CLASS], context: null, meta: null }, [countSpan, titleInst]);
    const labelList = div({ classes: [CLAN_MAP_LABEL_LIST_CLASS], context: null, meta: null });
    const section = div({ classes: [CLAN_MAP_SIDE_SECTION_CLASS], context: null, meta: null }, [header, labelList]);
    return { section, countSpan, titleInst, labelList };
}

interface SidePanelCtx {
    active: ReturnType<typeof buildSection>;
    lastKnown: ReturnType<typeof buildSection>;
    empty$: Instance;
    rowPool: Map<string, RowRefs>;
    handlers: RowHandlers;
    liveStore: LiveStore<PositionRow>;
}

function reconcileSideRows(ctx: SidePanelCtx, change: LiveChange): void {
    for (const key of change.removed) {
        const refs = ctx.rowPool.get(key);
        if (refs === undefined) continue;
        refs.instance.destroy();
        ctx.rowPool.delete(key);
    }
    for (const key of change.changed) {
        const row = ctx.liveStore.get(key);
        if (row === undefined) continue;
        const existing = ctx.rowPool.get(key);
        if (existing === undefined)
            ctx.rowPool.set(
                key,
                buildRowShell(row, ctx.handlers, (refs) => patchRow(refs, row)),
            );
        else patchRow(existing, row);
    }
}

function applyPanelChange(ctx: SidePanelCtx, change: LiveChange): void {
    reconcileSideRows(ctx, change);
    const all = ctx.liveStore
        .all()
        .slice()
        .sort((a, b) => a.latest_rsn.localeCompare(b.latest_rsn));
    const activeRefs: RowRefs[] = [];
    const lastKnownRefs: RowRefs[] = [];
    for (const row of all) {
        const refs = ctx.rowPool.get(row.account_hash);
        if (refs === undefined) continue;
        if (isPositionActive(row)) activeRefs.push(refs);
        else lastKnownRefs.push(refs);
    }
    placeRows(ctx.active.labelList, activeRefs);
    placeRows(ctx.lastKnown.labelList, lastKnownRefs);
    ctx.active.countSpan.setText(String(activeRefs.length));
    ctx.lastKnown.countSpan.setText(String(lastKnownRefs.length));
    ctx.active.titleInst.setText(activeRefs.length === 1 ? "Live Clannie" : "Live Clannies");
    ctx.active.section.el.classList.toggle("is-empty", activeRefs.length === 0);
    ctx.lastKnown.section.el.classList.toggle("is-empty", lastKnownRefs.length === 0);
    ctx.empty$.el.classList.toggle("is-visible", all.length === 0);
}

export function buildSidePanel(liveStore: LiveStore<PositionRow>, api: ClanMapApi): Instance {
    const ctx: SidePanelCtx = {
        active: buildSection("Live Clannies"),
        lastKnown: buildSection("Last Known"),
        empty$: div({ classes: [CLAN_MAP_SIDE_EMPTY_CLASS], context: null, meta: null }, [buildAwaitingMsg()]),
        rowPool: new Map<string, RowRefs>(),
        handlers: {
            onFocus: api.focusOnHash,
            onToggleFollow: api.toggleFollow,
            onToggleAlert: api.toggleAlert,
            followedHash$: api.followedHash$,
            alertedHashes$: api.alertedHashes$,
        },
        liveStore,
    };
    liveStore.onChange((change) => applyPanelChange(ctx, change));
    return div({ classes: [CLAN_MAP_SIDE_CLASS], context: null, meta: null }, [
        ctx.active.section,
        ctx.lastKnown.section,
        ctx.empty$,
    ]);
}
