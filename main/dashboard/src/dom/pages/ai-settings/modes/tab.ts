import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    effect,
    heading,
    icon,
    section,
    type Instance,
    baseProps,
} from "../../../factory";
import { modesByTier, modesStore } from "../../../../ai/modes-store/index.js";
import { ATTR_HIDDEN, HIDDEN_FALSE, HIDDEN_TRUE } from "../shared.js";
import { buildModeCard } from "./mode-card.js";
import { MODE_CONCERNS, type ModeConcernDef } from "../../../../state/ai-settings/modes-defs.js";

const TAB_CLASS = "ai-settings-modes";
const SECTION_CLASS = "ai-settings-modes__section";
const HEAD_CLASS = "ai-settings-modes__section-head";
const HEAD_ICON_CLASS = "ai-settings-modes__section-icon";
const HEAD_TITLE_CLASS = "ai-settings-modes__section-title";
const GRID_CLASS = "ai-settings-modes__grid";
const FOOTER_CLASS = "ai-settings-modes__footer";
const RESET_ALL_CLASS = "ai-settings-modes__reset-all";

function buildSectionHead(def: ModeConcernDef): Instance {
    return div(baseProps([HEAD_CLASS]), [
        icon({ name: def.icon, classes: [HEAD_ICON_CLASS], context: null, meta: null }),
        heading("h3", { classes: [HEAD_TITLE_CLASS], text: def.title, context: null, meta: null }),
    ]);
}

function buildModeSection(def: ModeConcernDef): Instance {
    const grid = div(baseProps([GRID_CLASS]));
    for (const mode of modesByTier(def.tier)) grid.addChild(buildModeCard(mode));
    return div({ classes: [SECTION_CLASS], data: { "concern-id": def.id }, context: null, meta: null }, [
        buildSectionHead(def),
        grid,
    ]);
}

function resetBtn(): Instance<HTMLButtonElement> {
    const btn = button({
        variant: BTN_VARIANT_OUTLINE,
        classes: [RESET_ALL_CLASS],
        text: "Reset all modes",
        ariaLabel: "Reset all mode toggles to defaults",
        title: "Reset all modes",
        context: "reset every mode toggle",
        meta: ["destructive"],
        onClick: () => modesStore.resetAll(),
    });
    btn.trackDispose(
        effect(() => {
            const overrides = modesStore.overrides$();
            const has = Object.keys(overrides).length > 0;
            btn.setAttr(ATTR_HIDDEN, has ? HIDDEN_FALSE : HIDDEN_TRUE);
        }),
    );
    return btn;
}

function buildFooter(): Instance {
    const reset = resetBtn();
    const footer = div(baseProps([FOOTER_CLASS]), [reset]);
    footer.trackDispose(
        effect(() => {
            const has = Object.keys(modesStore.overrides$()).length > 0;
            footer.setAttr(ATTR_HIDDEN, has ? HIDDEN_FALSE : HIDDEN_TRUE);
        }),
    );
    return footer;
}

export function mount(host: Instance): void {
    const sections: Instance[] = MODE_CONCERNS.map(buildModeSection);
    const sec: Instance = section(baseProps([TAB_CLASS]), [...sections, buildFooter()]);
    host.setChildren(sec);
}
