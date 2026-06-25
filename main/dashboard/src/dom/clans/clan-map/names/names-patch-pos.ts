import type { CardRefs } from "./names-card.js";

export function patchCardPosition(card: CardRefs, px: number, py: number): void {
    if (card.lastLeft !== px) {
        card.instance.el.style.left = `${px}px`;
        card.lastLeft = px;
    }
    if (card.lastTop !== py) {
        card.instance.el.style.top = `${py}px`;
        card.lastTop = py;
    }
}
