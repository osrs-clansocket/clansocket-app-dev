import { AI_BAR_HISTORY_CLASS } from "../../shared/constants/ai-bar-constants.js";
import { scrollBottom } from "./panel/layout/scroll-to-bottom.js";
import { withThinkingEl } from "./thinking-host.js";

export function scrollThinkingVisible(): void {
    withThinkingEl((host) => {
        const scrollParent = host.closest<HTMLElement>(`.${AI_BAR_HISTORY_CLASS}`);
        if (scrollParent) scrollBottom(scrollParent);
    }, undefined);
}
