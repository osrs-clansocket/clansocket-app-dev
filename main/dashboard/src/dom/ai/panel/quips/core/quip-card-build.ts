import { div, type Instance } from "../../../../factory";

const CARD_CLASS = "ai-bar__auth-card";
const QUIP_CLASS = "ai-bar__auth-quip";
const MOOD_CLASS = "ai-bar__auth-mood";
const BTNS_CLASS = "ai-bar__auth-btns";

export function buildCardElements(
    actions: readonly Instance[] | undefined,
    extraClasses: readonly string[] | undefined,
): {
    card: Instance;
    quipEl: Instance;
    moodEl: Instance;
} {
    const quipEl = div({ classes: [QUIP_CLASS], context: null, meta: null });
    const moodEl = div({ classes: [MOOD_CLASS], context: null, meta: null });
    const children: Instance[] = [quipEl, moodEl];
    if (actions && actions.length > 0) {
        children.push(div({ classes: [BTNS_CLASS], context: null, meta: null }, [...actions]));
    }
    const cardClasses = extraClasses && extraClasses.length > 0 ? [CARD_CLASS, ...extraClasses] : [CARD_CLASS];
    const card = div({ classes: cardClasses, context: null, meta: null }, children);
    return { card, quipEl, moodEl };
}
