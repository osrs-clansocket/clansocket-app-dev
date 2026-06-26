import { div, icon, span, type Instance, baseProps, textProps } from "../../dom/factory";
import { TOOLTIPS, type SlotMeta } from "../../ai/persona-store/index.js";
import type { Tooltip } from "../../shared/types/tooltip-types.js";

const TIP_CLASS = "ai-settings__tip";
const TIP_TRIGGER_CLASS = "ai-settings__tip-trigger";
const TIP_POP_CLASS = "ai-settings__tip-pop";
const TIP_ROW_CLASS = "ai-settings__tip-row";
const TIP_KEY_CLASS = "ai-settings__tip-key";
const TIP_VAL_CLASS = "ai-settings__tip-val";

function buildTipRow(keyText: string, valText: string): Instance {
    return div(baseProps([TIP_ROW_CLASS]), [
        span(textProps([TIP_KEY_CLASS], keyText)),
        span(textProps([TIP_VAL_CLASS], valText)),
    ]);
}

function buildTipPopover(tip: Tooltip): Instance {
    return div({ classes: [TIP_POP_CLASS], role: "tooltip", context: null, meta: null }, [
        buildTipRow("What this is", tip.what),
        buildTipRow("Why it's needed", tip.why),
        buildTipRow("How to define it", tip.how),
    ]);
}

export function buildTipIcon(meta: SlotMeta): Instance | null {
    const tip = TOOLTIPS[meta.key];
    if (!tip) return null;
    const trigger = span({
        classes: [TIP_TRIGGER_CLASS],
        ariaLabel: `Show details for ${meta.displayName}`,
        context: null,
        meta: null,
        tabindex: "0",
    });
    trigger.addChild(icon({ name: "info-circle", context: null, meta: null }).el);
    return div(baseProps([TIP_CLASS]), [trigger, buildTipPopover(tip)]);
}
