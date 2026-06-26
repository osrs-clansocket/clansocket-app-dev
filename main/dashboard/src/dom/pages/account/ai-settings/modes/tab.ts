import {
    button,
    derived,
    div,
    effect,
    heading,
    icon,
    section,
    signal,
    span,
    type Instance,
    baseProps,
    textProps,
} from "../../../../factory";
import { modesByTier, modesStore } from "../../../../../ai/modes-store/index.js";
import { ATTR_HIDDEN, HIDDEN_FALSE, HIDDEN_TRUE } from "../shared.js";
import { buildModeCard } from "./mode-card.js";
import { MODE_CONCERNS, type ModeConcernDef } from "../../../../../state/ai-settings/modes-defs.js";

const TAB_CLASS = "account-ai-settings__modes";
const ACCORDION_CLASS = "account-ai-settings__accordion";
const SECTION_CLASS = "account-ai-settings__concern";
const SECTION_OPEN_CLASS = "account-ai-settings__concern--open";
const HEAD_CLASS = "account-ai-settings__concern-head";
const HEAD_ICON_CLASS = "account-ai-settings__concern-icon";
const HEAD_TITLE_CLASS = "account-ai-settings__concern-title";
const HEAD_BADGE_CLASS = "account-ai-settings__concern-badge";
const HEAD_CHEVRON_CLASS = "account-ai-settings__concern-chevron";
const BODY_CLASS = "account-ai-settings__concern-body";
const GRID_CLASS = "account-ai-settings__modes-grid";
const TAB_FOOTER_CLASS = "account-ai-settings__tab-footer";
const RESET_ALL_CLASS = "account-ai-settings__reset-all";

function concernHasOverride(def: ModeConcernDef): boolean {
    const overrides = modesStore.overrides$();
    for (const mode of modesByTier(def.tier)) {
        if (overrides[mode.key] !== undefined) return true;
    }
    return false;
}

function buildConcernHead(
    def: ModeConcernDef,
    open: ReturnType<typeof signal<boolean>>,
    badge: Instance,
): Instance<HTMLButtonElement> {
    const head = button({
        ariaLabel: `Toggle ${def.title} section`,
        classes: [HEAD_CLASS],
        type: "button",
        ariaExpanded: derived(() => (open() ? "true" : "false")),
        ariaControls: `mode-concern-body-${def.id}`,
        context: `toggle ${def.title} section`,
        meta: ["disclosure"],
        onClick: () => open.set(!open()),
    });
    head.addChild(icon({ name: def.icon, classes: [HEAD_ICON_CLASS], context: null, meta: null }));
    head.addChild(heading("h3", { classes: [HEAD_TITLE_CLASS], text: def.title, context: null, meta: null }));
    head.addChild(badge);
    head.addChild(icon({ name: "chevron-down", classes: [HEAD_CHEVRON_CLASS], context: null, meta: null }));
    return head;
}

function buildConcernSection(def: ModeConcernDef): Instance {
    const open = signal<boolean>(def.defaultOpen === true);
    const grid = div(baseProps([GRID_CLASS]));
    for (const mode of modesByTier(def.tier)) grid.addChild(buildModeCard(mode));
    const body = div(baseProps([BODY_CLASS]), [grid]);
    body.el.id = `mode-concern-body-${def.id}`;
    const badge = span(textProps([HEAD_BADGE_CLASS], "overridden"));
    const head = buildConcernHead(def, open, badge);
    const sec = div({ classes: [SECTION_CLASS], data: { "concern-id": def.id }, context: null, meta: null }, [
        head,
        body,
    ]);
    sec.trackDispose(
        effect(() => {
            sec.toggleClass(SECTION_OPEN_CLASS, open());
            body.setAttr(ATTR_HIDDEN, open() ? HIDDEN_FALSE : HIDDEN_TRUE);
        }),
    );
    sec.trackDispose(
        effect(() => {
            badge.setAttr(ATTR_HIDDEN, concernHasOverride(def) ? HIDDEN_FALSE : HIDDEN_TRUE);
        }),
    );
    return sec;
}

function resetBtn(): Instance<HTMLButtonElement> {
    const btn = button({
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

export function mount(host: Instance): void {
    const accordion = div(baseProps([ACCORDION_CLASS]));
    for (const concern of MODE_CONCERNS) accordion.addChild(buildConcernSection(concern));
    const footer = div(baseProps([TAB_FOOTER_CLASS]), [resetBtn()]);
    const sec: Instance = section(baseProps([TAB_CLASS]), [accordion, footer]);
    host.setChildren(sec);
}
