import { div, effect, heading, paragraph, type Instance, baseProps, textProps } from "../../../factory";
import type { ManagedClan } from "../../../../state/clans/clans-client/index.js";
import { createWhitelistStore } from "../../../../state/clans/stores/whitelist-store.js";
import { type RankPoolEntry } from "./whitelist-buttons.js";
import { applyWhitelistEffect, type WhitelistCtx } from "./whitelist-pool.js";
import {
    ACCOUNT_BRANDING_GRID_CLASS,
    ACCOUNT_CLAN_BRANDING_SECTION_CLASS,
    ACCOUNT_EMPTY_CLASS,
    ACCOUNT_PANEL_TITLE_CLASS,
    ACCOUNT_RANK_GRID_CLASS,
    ACCOUNT_SECTION_HINT_CLASS,
} from "../../../../shared/constants/account-constants.js";

function panelShell(grid: Instance, empty: Instance): Instance {
    return div(baseProps([ACCOUNT_CLAN_BRANDING_SECTION_CLASS]), [
        heading("h3", { classes: [ACCOUNT_PANEL_TITLE_CLASS], text: "Rank-whitelist", context: null, meta: null }),
        paragraph(
            textProps(
                [ACCOUNT_SECTION_HINT_CLASS],
                "Auto-grants manager access to any clan member verified with ClanSocket who holds this rank.",
            ),
        ),
        grid,
        empty,
    ]);
}

export function buildClanWhitelist(clan: ManagedClan): Instance {
    const grid = div(baseProps([ACCOUNT_BRANDING_GRID_CLASS, ACCOUNT_RANK_GRID_CLASS]));
    const empty = paragraph(
        textProps([ACCOUNT_EMPTY_CLASS], "No roster yet. Ranks appear when a plugin in this clan reports its members."),
    );
    empty.el.hidden = true;
    const store = createWhitelistStore(clan.slug);
    const ctx: WhitelistCtx = {
        clan,
        grid,
        empty,
        dataRef: { activeByRank: new Map() },
        entryPool: new Map<string, RankPoolEntry>(),
        refresh: () => store.refresh(),
    };
    const root = panelShell(grid, empty);
    root.trackDispose(effect(() => applyWhitelistEffect(ctx, store)));
    return root;
}
