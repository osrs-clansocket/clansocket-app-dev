import { div, type Instance, baseProps } from "../../../../factory";

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
    const quipEl = div(baseProps([QUIP_CLASS]));
    const moodEl = div(baseProps([MOOD_CLASS]));
    const children: Instance[] = [quipEl, moodEl];
    if (actions && actions.length > 0) {
        children.push(div(baseProps([BTNS_CLASS]), [...actions]));
    }
    const cardClasses = extraClasses && extraClasses.length > 0 ? [CARD_CLASS, ...extraClasses] : [CARD_CLASS];
    const card = div(baseProps(cardClasses), children);
    return { card, quipEl, moodEl };
}
