import { div, type Instance, baseProps } from "../../factory";
import type { PositionRow } from "../../../state/clans/stores/positions-store.js";
import {
    CLAN_MAP_LABEL_ROW_CLASS,
    CLAN_MAP_ROW_CONTENT_CLASS,
    CLAN_MAP_ROW_MAIN_CLASS,
    CLAN_MAP_ROW_UPPER_CLASS,
} from "../../../shared/constants/clan/clan-map-constants.js";
import { IS_CLICKABLE_CLASS } from "../../../shared/constants/state-modifier-constants.js";
import { buildBlipRail, buildRowParts, type RowParts } from "./map-row-parts.js";
import { buildActionRow } from "./map-row-actions.js";

import type { RowHandlers } from "./row-handlers-types.js";

export type { RowHandlers } from "./row-handlers-types.js";

export interface RowRefs {
    instance: Instance;
    rsnTagInst: Instance;
    topLine: Instance;
    regionInst: Instance;
    hpInst: Instance;
    prayerInst: Instance;
    worldInst: Instance;
    activityInst: Instance;
    metaGroup: Instance;
    prayersInst: Instance;
    prayerImgs: Map<string, Instance>;
    band: Instance;
    combatInst: Instance;
    combatIcon: Instance;
    combatNameInst: Instance;
    combatDmgInst: Instance;
    currentRsn: string;
}

function buildRowInstance(row: PositionRow, h: RowHandlers, parts: RowParts, actions: Instance): Instance {
    const main = div(baseProps([CLAN_MAP_ROW_MAIN_CLASS]), [parts.topLine, parts.statsRow]);
    const upper = div(baseProps([CLAN_MAP_ROW_UPPER_CLASS]), [main, actions]);
    const content = div(baseProps([CLAN_MAP_ROW_CONTENT_CLASS]), [upper, parts.band]);
    return div(
        {
            classes: [CLAN_MAP_LABEL_ROW_CLASS, IS_CLICKABLE_CLASS],
            context: `focus on ${row.latest_rsn}`,
            meta: null,
            onClick: () => {
                const currentFollow = h.followedHash$();
                if (currentFollow === row.account_hash) return;
                if (currentFollow !== null) h.onToggleFollow(row.account_hash);
                else h.onFocus(row.account_hash);
            },
        },
        [buildBlipRail(), content],
    );
}

function partsToRefs(instance: Instance, parts: RowParts, rsn: string): RowRefs {
    return {
        instance,
        rsnTagInst: parts.rsnTagInst,
        topLine: parts.topLine,
        regionInst: parts.regionInst,
        hpInst: parts.hpPair.labelInst,
        prayerInst: parts.prayerPair.labelInst,
        worldInst: parts.worldInst,
        activityInst: parts.activityInst,
        metaGroup: parts.metaGroup,
        prayersInst: parts.prayersInst,
        prayerImgs: new Map<string, Instance>(),
        band: parts.band,
        combatInst: parts.combatInst,
        combatIcon: parts.combatPair.iconInst,
        combatNameInst: parts.combatPair.labelInst,
        combatDmgInst: parts.combatDmgInst,
        currentRsn: rsn,
    };
}

export function buildRowShell(row: PositionRow, h: RowHandlers, applyInitial: (refs: RowRefs) => void): RowRefs {
    const parts = buildRowParts(row);
    const actions = buildActionRow(row, h);
    const instance = buildRowInstance(row, h, parts, actions);
    const refs = partsToRefs(instance, parts, row.latest_rsn);
    applyInitial(refs);
    return refs;
}
