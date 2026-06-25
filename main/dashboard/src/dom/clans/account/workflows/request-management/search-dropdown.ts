import { BTN_VARIANT_DEFAULT, button, input, span, type Instance } from "../../../../factory";
import { clansClient, type ClanSearchHit } from "../../../../../state/clans/clans-client/index.js";
import type { ChipController } from "./chips.js";
import { buildClanGlyph } from "./clan-glyph-builder.js";
import { buildColorDot } from "./color-dot-builder.js";
import {
    ACCOUNT_AUTOCOMPLETE_CHECK_CLASS,
    ACCOUNT_AUTOCOMPLETE_NAME_CLASS,
    ACCOUNT_AUTOCOMPLETE_ROW_CLASS,
} from "../../../../../shared/constants/account-constants.js";

export interface SearchController {
    runSearch: (q: string) => Promise<void>;
    closeAndClear: () => void;
}

function buildHitCheck(isSelected: boolean): Instance<HTMLInputElement> {
    const check = input({
        ariaLabel: "Clan selected",
        classes: [ACCOUNT_AUTOCOMPLETE_CHECK_CLASS],
        type: "checkbox",
        tabindex: "-1",
        ariaHidden: "true",
        context: "selection state for this clan (toggled by the row)",
        meta: ["input"],
    });
    check.el.checked = isSelected;
    return check;
}

function buildHitRow(hit: ClanSearchHit, isSelected: boolean, onClick: () => void): Instance {
    return button(
        {
            variant: BTN_VARIANT_DEFAULT,
            classes: [ACCOUNT_AUTOCOMPLETE_ROW_CLASS],
            type: "button",
            ariaLabel: hit.displayName,
            data: { slug: hit.slug },
            context: "toggle selecting this clan",
            meta: ["choice", "clan"],
            onClick,
        },
        [
            buildHitCheck(isSelected),
            buildClanGlyph(
                hit,
                "account__autocomplete-avatar",
                "account__autocomplete-avatar-img",
                "account__autocomplete-avatar-glyph",
            ),
            span({ classes: [ACCOUNT_AUTOCOMPLETE_NAME_CLASS], text: hit.displayName, context: null, meta: null }),
            buildColorDot(hit.color),
        ],
    );
}

function makeRenderMatches(
    dropdown: Instance,
    chips: ChipController,
    onHitClick: (hit: ClanSearchHit) => void,
    closeAndClear: () => void,
): (matches: readonly ClanSearchHit[]) => void {
    return (matches) => {
        if (matches.length === 0) {
            closeAndClear();
            return;
        }
        dropdown.setChildren(
            ...matches.map((hit) => buildHitRow(hit, chips.selectedClans.has(hit.slug), () => onHitClick(hit))),
        );
        dropdown.el.hidden = false;
    };
}

export function createSearchController(
    dropdown: Instance,
    chips: ChipController,
    clanInput: Instance<HTMLInputElement>,
): SearchController {
    const closeAndClear = (): void => {
        dropdown.el.hidden = true;
        dropdown.clear();
    };
    const onHitClick = (hit: ClanSearchHit): void => {
        if (chips.selectedClans.has(hit.slug)) chips.removeChip(hit.slug);
        else chips.addChip(hit);
        clanInput.el.value = "";
        closeAndClear();
        clanInput.el.focus();
    };
    const renderMatches = makeRenderMatches(dropdown, chips, onHitClick, closeAndClear);
    return {
        runSearch: async (q: string): Promise<void> => {
            renderMatches(await clansClient.searchClans(q));
        },
        closeAndClear,
    };
}
