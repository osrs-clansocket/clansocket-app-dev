import { button, span, type Instance, textProps } from "../../../../factory";
import type { ClanSearchHit } from "../../../../../state/clans/clans-client/index.js";
import { buildClanGlyph } from "./clan-glyph-builder.js";
import {
    ACCOUNT_CHIP_CLASS,
    ACCOUNT_CHIP_NAME_CLASS,
    ACCOUNT_CHIP_X_CLASS,
} from "../../../../../shared/constants/account-constants.js";

export interface ChipController {
    selectedClans: Map<string, ClanSearchHit>;
    addChip: (hit: ClanSearchHit) => void;
    removeChip: (slug: string) => void;
    removeLast: () => void;
}

function buildChipNode(hit: ClanSearchHit, closeBtn: Instance): Instance {
    const chip = span({ classes: [ACCOUNT_CHIP_CLASS], data: { slug: hit.slug }, context: null, meta: null }, [
        buildClanGlyph(hit, "account__chip-icon", "account__chip-icon-img", "account__chip-icon-glyph"),
        span(textProps([ACCOUNT_CHIP_NAME_CLASS], hit.displayName)),
        closeBtn,
    ]);
    if (hit.color) chip.el.style.setProperty("--clan-accent", hit.color);
    return chip;
}

function buildCloseBtn(hit: ClanSearchHit, onClose: () => void, clanInput: Instance<HTMLInputElement>): Instance {
    return button({
        text: "✕",
        classes: [ACCOUNT_CHIP_X_CLASS],
        type: "button",
        ariaLabel: `Remove ${hit.displayName}`,
        context: "remove this clan from the selection",
        meta: ["action", "clan"],
        onClick: (e) => {
            e.stopPropagation();
            onClose();
            clanInput.el.focus();
        },
    });
}

export function createChipController(clanField: Instance, clanInput: Instance<HTMLInputElement>): ChipController {
    const selectedClans = new Map<string, ClanSearchHit>();
    const chipInstances = new Map<string, Instance>();
    const removeChip = (slug: string): void => {
        chipInstances.get(slug)?.destroy();
        chipInstances.delete(slug);
        selectedClans.delete(slug);
    };
    const addChip = (hit: ClanSearchHit): void => {
        if (selectedClans.has(hit.slug)) return;
        const chip = buildChipNode(
            hit,
            buildCloseBtn(hit, () => removeChip(hit.slug), clanInput),
        );
        clanField.addBefore(chip, clanInput.el);
        selectedClans.set(hit.slug, hit);
        chipInstances.set(hit.slug, chip);
    };
    const removeLast = (): void => {
        const lastSlug = [...selectedClans.keys()].pop();
        if (lastSlug) removeChip(lastSlug);
    };
    return { selectedClans, addChip, removeChip, removeLast };
}
