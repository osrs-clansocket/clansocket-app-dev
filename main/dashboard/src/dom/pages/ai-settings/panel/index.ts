import {
    button,
    derived,
    div,
    effect,
    expandWithFade,
    heading,
    icon,
    signal,
    span,
    type Instance,
    baseProps,
    textProps,
} from "../../../factory";
import { modesStore } from "../../../../ai/modes-store/index.js";
import { personaStore } from "../../../../ai/persona-store/index.js";
import type { ConcernDef } from "../../../../state/ai-settings/panel-defs.js";
import { ATTR_HIDDEN, HIDDEN_FALSE, HIDDEN_TRUE } from "../../../../shared/constants/hidden-attr-constants.js";
import { buildRow } from "../../../../ai-settings/composers/field-composer.js";

const SECTION_CLASS = "ai-settings__concern";
const SECTION_OPEN_CLASS = "ai-settings__concern--open";
const HEAD_CLASS = "ai-settings__concern-head";
const HEAD_ICON_CLASS = "ai-settings__concern-icon";
const HEAD_TITLE_CLASS = "ai-settings__concern-title";
const HEAD_BADGE_CLASS = "ai-settings__concern-badge";
const HEAD_CHEVRON_CLASS = "ai-settings__concern-chevron";
const BODY_CLASS = "ai-settings__concern-body";

function rowHasOverride(row: ConcernDef["rows"][number]): boolean {
    if (typeof row === "string") return personaStore.isOverride(row);
    for (const key of row) if (personaStore.isOverride(key)) return true;
    return false;
}

function concernHasOverride(def: ConcernDef): boolean {
    for (const r of def.rows) if (rowHasOverride(r)) return true;
    return false;
}

function buildConcernHead(def: ConcernDef, open: ReturnType<typeof signal<boolean>>, badge: Instance): Instance {
    const iconEl = icon({ name: def.icon, classes: [HEAD_ICON_CLASS], context: null, meta: null });
    const titleEl = heading("h3", { classes: [HEAD_TITLE_CLASS], text: def.title, context: null, meta: null });
    const chevron = icon({ name: "chevron-down", classes: [HEAD_CHEVRON_CLASS], context: null, meta: null });
    const head = button({
        ariaLabel: `Toggle ${def.title} section`,
        classes: [HEAD_CLASS],
        type: "button",
        ariaExpanded: derived(() => (open() ? "true" : "false")),
        ariaControls: `concern-body-${def.id}`,
        context: `toggle ${def.title} section`,
        meta: ["disclosure"],
        onClick: () => open.set(!open()),
    });
    head.addChild(iconEl);
    head.addChild(titleEl);
    head.addChild(badge);
    head.addChild(chevron);
    return head;
}

function bindModeVisibility(section: Instance, def: ConcernDef): void {
    if (def.requiresMode === undefined) return;
    const required = def.requiresMode;
    section.trackDispose(
        effect(() => {
            section.setAttr(ATTR_HIDDEN, modesStore.isOn(required) ? HIDDEN_FALSE : HIDDEN_TRUE);
        }),
    );
}

interface SectionEffectsArgs {
    section: Instance;
    body: Instance;
    badge: Instance;
    def: ConcernDef;
    open: ReturnType<typeof signal<boolean>>;
}

function bindSectionEffects(args: SectionEffectsArgs): void {
    const { section, body, badge, def, open } = args;
    section.trackDispose(
        effect(() => {
            section.toggleClass(SECTION_OPEN_CLASS, open());
            expandWithFade(body.el, open());
        }),
    );
    section.trackDispose(
        effect(() => {
            badge.setAttr(ATTR_HIDDEN, concernHasOverride(def) ? HIDDEN_FALSE : HIDDEN_TRUE);
        }),
    );
    bindModeVisibility(section, def);
}

export function buildConcernSection(def: ConcernDef): Instance {
    const open = signal<boolean>(def.defaultOpen === true);
    const body = div(baseProps([BODY_CLASS]));
    for (const row of def.rows) body.addChild(buildRow(row));
    body.el.id = `concern-body-${def.id}`;
    const badge = span(textProps([HEAD_BADGE_CLASS], "overridden"));
    const head = buildConcernHead(def, open, badge);
    const section = div({ classes: [SECTION_CLASS], data: { "concern-id": def.id }, context: null, meta: null }, [
        head,
        body,
    ]);
    bindSectionEffects({ section, body, badge, def, open });
    return section;
}

export function buildFlatConcernSection(def: ConcernDef): Instance {
    const body = div(baseProps([BODY_CLASS]));
    for (const row of def.rows) body.addChild(buildRow(row));
    body.el.id = `concern-body-${def.id}`;
    return body;
}
