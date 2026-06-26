import { div } from "../../../factory/layout-ops";
import { span } from "../../../factory/content-ops";
import { rsnTag } from "../../../factory/data-ops/identity/rsn-tag.js";
import { iconLabel, ICON_LABEL_SIZE_SM } from "../../../factory/data-ops/icon-label.js";
import type { Instance } from "../../../factory/core";
import {
    MAP_NAME_CARD_BODY_CLASS,
    MAP_NAME_CARD_CLASS,
    MAP_NAME_CARD_COMBAT_CLASS,
    MAP_NAME_CARD_ENTRY_CLASS,
    MAP_NAME_CARD_ENTRY_DMG_CLASS,
    MAP_NAME_CARD_ENTRY_NAME_CLASS,
    MAP_NAME_CARD_NAME_CLASS,
    MAP_NAME_CARD_PRAYERS_CLASS,
    MAP_NAME_CARD_RAIL_CLASS,
    MAP_NAME_CARD_REGION_CLASS,
    MAP_NAME_CARD_VITALS_CLASS,
} from "../../../../shared/constants/clan/clan-map-constants.js";
import { baseProps } from "../../../factory/index.js";

export const BLIP_COLOR = "#ff5252";

const HP_ICON_NAME = "osrs-sprite_skill_hitpoints";
const PRAYER_ICON_NAME = "osrs-sprite_skill_prayer";
const ATTACK_ICON_NAME = "osrs-hiscores_attack";

export interface CardRefs {
    instance: Instance;
    rail: Instance;
    regionInst: Instance;
    hpInst: Instance;
    prayerInst: Instance;
    combatInst: Instance;
    combatIcon: Instance;
    combatNameInst: Instance;
    combatDmgInst: Instance;
    prayersInst: Instance;
    prayerImgs: Map<string, Instance>;
    lastRegion?: string;
    lastHp?: string;
    lastPrayer?: string;
    lastHasCombat?: boolean;
    lastLeft?: number;
    lastTop?: number;
}

export function prayerSpriteSrc(name: string): string {
    const lower = name.toLowerCase();
    const parts: string[] = [];
    let lastUnderscore = true;
    for (const ch of lower) {
        const isAlphaNum = (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9");
        if (isAlphaNum) {
            parts.push(ch);
            lastUnderscore = false;
        } else if (!lastUnderscore) {
            parts.push("_");
            lastUnderscore = true;
        }
    }
    let slug = parts.join("");
    if (slug.endsWith("_")) slug = slug.slice(0, -1);
    return `/resources/osrs/game_prayer/${slug}.webp`;
}

function buildVitalsRow(): { row: Instance; hpInst: Instance; prayerInst: Instance } {
    const hpPair = iconLabel({ name: HP_ICON_NAME, alt: "HP", size: ICON_LABEL_SIZE_SM, context: null, meta: null });
    const prayerPair = iconLabel({
        name: PRAYER_ICON_NAME,
        alt: "Prayer",
        size: ICON_LABEL_SIZE_SM,
        context: null,
        meta: null,
    });
    const row = div(baseProps([MAP_NAME_CARD_VITALS_CLASS]), [hpPair.instance, prayerPair.instance]);
    return { row, hpInst: hpPair.labelInst, prayerInst: prayerPair.labelInst };
}

interface CombatBlock {
    combatPair: ReturnType<typeof iconLabel>;
    combatDmgInst: Instance;
    combatInst: Instance;
}

function buildCombatBlock(): CombatBlock {
    const combatDmgInst = span(baseProps([MAP_NAME_CARD_ENTRY_DMG_CLASS]));
    combatDmgInst.el.style.color = BLIP_COLOR;
    const combatPair = iconLabel({
        name: ATTACK_ICON_NAME,
        alt: "attack",
        size: ICON_LABEL_SIZE_SM,
        classes: [MAP_NAME_CARD_ENTRY_CLASS],
        labelClasses: [MAP_NAME_CARD_ENTRY_NAME_CLASS],
        trailing: combatDmgInst,
        context: null,
        meta: null,
    });
    const combatInst = div(baseProps([MAP_NAME_CARD_COMBAT_CLASS]), [combatPair.instance]);
    return { combatPair, combatDmgInst, combatInst };
}

interface CardParts {
    rail: Instance;
    nameInst: Instance;
    regionSpan: Instance;
    vitals: ReturnType<typeof buildVitalsRow>;
    prayersInst: Instance;
    combat: ReturnType<typeof buildCombatBlock>;
}

function buildCardParts(rsn: string): CardParts {
    const rail = div(baseProps([MAP_NAME_CARD_RAIL_CLASS]));
    rail.el.style.background = BLIP_COLOR;
    return {
        rail,
        nameInst: rsnTag({ rsn, size: "sm", classes: [MAP_NAME_CARD_NAME_CLASS], context: null, meta: null }),
        regionSpan: span(baseProps([MAP_NAME_CARD_REGION_CLASS])),
        vitals: buildVitalsRow(),
        prayersInst: div(baseProps([MAP_NAME_CARD_PRAYERS_CLASS])),
        combat: buildCombatBlock(),
    };
}

export function buildCard(rsn: string): CardRefs {
    const p = buildCardParts(rsn);
    const body = div(baseProps([MAP_NAME_CARD_BODY_CLASS]), [
        p.nameInst,
        p.vitals.row,
        p.prayersInst,
        p.combat.combatInst,
        p.regionSpan,
    ]);
    return {
        instance: div(baseProps([MAP_NAME_CARD_CLASS]), [p.rail, body]),
        rail: p.rail,
        prayersInst: p.prayersInst,
        regionInst: p.regionSpan,
        hpInst: p.vitals.hpInst,
        prayerInst: p.vitals.prayerInst,
        combatInst: p.combat.combatInst,
        combatIcon: p.combat.combatPair.iconInst,
        combatNameInst: p.combat.combatPair.labelInst,
        combatDmgInst: p.combat.combatDmgInst,
        prayerImgs: new Map<string, Instance>(),
    };
}
