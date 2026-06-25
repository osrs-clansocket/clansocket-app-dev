import { div, iconLabel, ICON_LABEL_SIZE_SM, rsnTag, span, type Instance } from "../../factory";
import type { PositionRow } from "../../../state/clans/stores/positions-store.js";
import {
    CLAN_MAP_LABEL_REGION_CLASS,
    CLAN_MAP_ROW_BAND_CLASS,
    CLAN_MAP_ROW_COMBAT_CLASS,
    CLAN_MAP_ROW_COMBAT_DMG_CLASS,
    CLAN_MAP_ROW_COMBAT_ENTRY_CLASS,
    CLAN_MAP_ROW_COMBAT_NAME_CLASS,
    CLAN_MAP_ROW_META_CLASS,
    CLAN_MAP_ROW_META_GROUP_CLASS,
    CLAN_MAP_ROW_PRAYERS_CLASS,
    CLAN_MAP_ROW_RAIL_CLASS,
    CLAN_MAP_ROW_STAT_CLASS,
    CLAN_MAP_ROW_STAT_VALUE_CLASS,
    CLAN_MAP_ROW_STATS_CLASS,
    CLAN_MAP_ROW_TOP_CLASS,
} from "../../../shared/constants/clan/clan-map-constants.js";

export const BLIP_COLOR = "#ff5252";
const HP_ICON_NAME = "osrs-sprite_skill_hitpoints";
const PRAYER_ICON_NAME = "osrs-sprite_skill_prayer";
const ATTACK_ICON_NAME = "osrs-hiscores_attack";

export interface RowParts {
    hpPair: ReturnType<typeof iconLabel>;
    prayerPair: ReturnType<typeof iconLabel>;
    worldInst: Instance;
    activityInst: Instance;
    prayersInst: Instance;
    metaGroup: Instance;
    statsRow: Instance;
    rsnTagInst: Instance;
    regionInst: Instance;
    topLine: Instance;
    combatDmgInst: Instance;
    combatPair: ReturnType<typeof iconLabel>;
    combatInst: Instance;
    band: Instance;
}

export function buildBlipRail(): Instance {
    const rail = div({ classes: [CLAN_MAP_ROW_RAIL_CLASS], context: null, meta: null });
    rail.el.style.background = BLIP_COLOR;
    return rail;
}

function statPair(name: string, alt: string): ReturnType<typeof iconLabel> {
    return iconLabel({
        name,
        alt,
        size: ICON_LABEL_SIZE_SM,
        classes: [CLAN_MAP_ROW_STAT_CLASS],
        labelClasses: [CLAN_MAP_ROW_STAT_VALUE_CLASS],
        context: null,
        meta: null,
    });
}

function buildCombatRow(): { combatDmgInst: Instance; combatPair: ReturnType<typeof iconLabel>; combatInst: Instance } {
    const combatDmgInst = span({ classes: [CLAN_MAP_ROW_COMBAT_DMG_CLASS], context: null, meta: null });
    combatDmgInst.el.style.color = BLIP_COLOR;
    const combatPair = iconLabel({
        name: ATTACK_ICON_NAME,
        alt: "attack",
        size: ICON_LABEL_SIZE_SM,
        classes: [CLAN_MAP_ROW_COMBAT_ENTRY_CLASS],
        labelClasses: [CLAN_MAP_ROW_COMBAT_NAME_CLASS],
        trailing: combatDmgInst,
        context: null,
        meta: null,
    });
    const combatInst = div({ classes: [CLAN_MAP_ROW_COMBAT_CLASS], context: null, meta: null }, [combatPair.instance]);
    return { combatDmgInst, combatPair, combatInst };
}

function buildStatsCluster(): {
    hpPair: ReturnType<typeof statPair>;
    prayerPair: ReturnType<typeof statPair>;
    worldInst: Instance;
    activityInst: Instance;
    prayersInst: Instance;
    metaGroup: Instance;
    statsRow: Instance;
} {
    const hpPair = statPair(HP_ICON_NAME, "HP");
    const prayerPair = statPair(PRAYER_ICON_NAME, "Prayer");
    const worldInst = span({ classes: [CLAN_MAP_ROW_META_CLASS], context: null, meta: null });
    const activityInst = span({ classes: [CLAN_MAP_ROW_META_CLASS], context: null, meta: null });
    const prayersInst = div({ classes: [CLAN_MAP_ROW_PRAYERS_CLASS], context: null, meta: null });
    const metaGroup = div({ classes: [CLAN_MAP_ROW_META_GROUP_CLASS], context: null, meta: null }, [
        worldInst,
        activityInst,
    ]);
    const statsRow = div({ classes: [CLAN_MAP_ROW_STATS_CLASS], context: null, meta: null }, [
        hpPair.instance,
        prayerPair.instance,
        metaGroup,
    ]);
    return { hpPair, prayerPair, worldInst, activityInst, prayersInst, metaGroup, statsRow };
}

export function buildRowParts(row: PositionRow): RowParts {
    const stats = buildStatsCluster();
    const regionInst = span({ classes: [CLAN_MAP_LABEL_REGION_CLASS], context: null, meta: null });
    const rsnTagInst = rsnTag({ rsn: row.latest_rsn, context: null, meta: null });
    const topLine = div({ classes: [CLAN_MAP_ROW_TOP_CLASS], context: null, meta: null }, [rsnTagInst, regionInst]);
    const { combatDmgInst, combatPair, combatInst } = buildCombatRow();
    const band = div({ classes: [CLAN_MAP_ROW_BAND_CLASS], context: null, meta: null }, [
        stats.prayersInst,
        combatInst,
    ]);
    return { ...stats, regionInst, rsnTagInst, topLine, combatDmgInst, combatPair, combatInst, band };
}
