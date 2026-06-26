import { button, div, effect, icon, label, span, type Instance, baseProps, textProps } from "../../../factory";
import { buildGlassCheck } from "../../../forms/glass/inputs/glass-check.js";
import { MODE_TOOLTIPS, modesStore, type ModeMeta } from "../../../../ai/modes-store/index.js";
import { ATTR_HIDDEN, HIDDEN_FALSE, HIDDEN_TRUE } from "../shared.js";

const CARD_CLASS = "ai-settings__mode";
const CARD_OVERRIDDEN_CLASS = "ai-settings__mode--overridden";
const HEAD_CLASS = "ai-settings__mode-head";
const ICON_CLASS = "ai-settings__mode-icon";
const LABEL_CLASS = "ai-settings__mode-label";
const RESET_CLASS = "ai-settings__field-reset";

const TIP_CLASS = "ai-settings__tip";
const TIP_TRIGGER_CLASS = "ai-settings__tip-trigger";
const TIP_POP_CLASS = "ai-settings__tip-pop";
const TIP_ROW_CLASS = "ai-settings__tip-row";
const TIP_KEY_CLASS = "ai-settings__tip-key";
const TIP_VAL_CLASS = "ai-settings__tip-val";

function tipRow(key: string, val: string): Instance {
    return div(baseProps([TIP_ROW_CLASS]), [
        span(textProps([TIP_KEY_CLASS], key)),
        span(textProps([TIP_VAL_CLASS], val)),
    ]);
}

function buildTipPop(meta: ModeMeta): Instance | null {
    const tip = MODE_TOOLTIPS[meta.key];
    if (!tip) return null;
    const trigger = span({
        classes: [TIP_TRIGGER_CLASS],
        ariaLabel: `Show details for ${meta.displayName}`,
        context: null,
        meta: null,
        tabindex: "0",
    });
    trigger.addChild(icon({ name: "info-circle", context: null, meta: null }).el);
    const pop = div({ classes: [TIP_POP_CLASS], role: "tooltip", context: null, meta: null }, [
        tipRow("What this is", tip.what),
        tipRow("Why it's needed", tip.why),
        tipRow("How to use it", tip.how),
    ]);
    return div(baseProps([TIP_CLASS]), [trigger, pop]);
}

function buildToggle(meta: ModeMeta): Instance<HTMLLabelElement> {
    return buildGlassCheck({
        name: meta.key,
        checked: () => modesStore.isOn(meta.key),
        ariaLabel: `Toggle ${meta.displayName}`,
        onChange: (next) => modesStore.setMode(meta.key, next),
    });
}

function buildResetButton(meta: ModeMeta): Instance<HTMLButtonElement> {
    const btn = button(
        {
            classes: [RESET_CLASS],
            ariaLabel: `Reset ${meta.displayName} to default`,
            title: "Reset to default",
            context: `reset ${meta.displayName}`,
            meta: ["action"],
            onClick: () => modesStore.resetMode(meta.key),
        },
        [icon({ name: "arrow-counterclockwise", context: null, meta: null }).el],
    );
    btn.trackDispose(
        effect(() => {
            btn.setAttr(ATTR_HIDDEN, modesStore.isOverride(meta.key) ? HIDDEN_FALSE : HIDDEN_TRUE);
        }),
    );
    return btn;
}

export function buildModeCard(meta: ModeMeta): Instance {
    const iconEl = icon({ name: meta.icon, classes: [ICON_CLASS], context: null, meta: null });
    const labelEl = label(textProps([LABEL_CLASS], meta.displayName));
    const tipIcon = buildTipPop(meta);
    const reset = buildResetButton(meta);
    const toggle = buildToggle(meta);

    const headChildren: Instance[] = [iconEl, labelEl];
    if (tipIcon !== null) headChildren.push(tipIcon);
    headChildren.push(reset);

    const head = div(baseProps([HEAD_CLASS]), headChildren);
    const card = div(baseProps([CARD_CLASS]), [head, toggle]);

    card.trackDispose(
        effect(() => {
            card.toggleClass(CARD_OVERRIDDEN_CLASS, modesStore.isOverride(meta.key));
        }),
    );

    return card;
}
