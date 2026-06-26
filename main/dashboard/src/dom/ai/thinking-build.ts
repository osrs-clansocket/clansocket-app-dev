import { createInstance, image, span, type Instance, baseProps } from "../factory";
import { AI_BAR_THINK_ICON_CLASS, AI_BAR_THINK_LABEL_CLASS } from "../../shared/constants/ai-bar-constants.js";
import { withThinkingEl } from "./thinking-host.js";
import { scrollThinkingVisible } from "./thinking-scroll.js";

function buildThinkEls(host: Instance): { icon: HTMLImageElement; label: HTMLSpanElement } {
    const iconInst = image({ src: "", classes: [AI_BAR_THINK_ICON_CLASS], context: null, meta: null });
    const labelInst = span(baseProps([AI_BAR_THINK_LABEL_CLASS]));
    host.setChildren(iconInst, labelInst);
    scrollThinkingVisible();
    return { icon: iconInst.el, label: labelInst.el };
}

export function ensureThinkEls(): { icon: HTMLImageElement; label: HTMLSpanElement } | null {
    return withThinkingEl((hostEl) => {
        const existingIcon = hostEl.querySelector<HTMLImageElement>(`.${AI_BAR_THINK_ICON_CLASS}`);
        const existingLabel = hostEl.querySelector<HTMLSpanElement>(`.${AI_BAR_THINK_LABEL_CLASS}`);
        if (existingIcon && existingLabel) return { icon: existingIcon, label: existingLabel };
        return buildThinkEls(createInstance(hostEl));
    }, null);
}
