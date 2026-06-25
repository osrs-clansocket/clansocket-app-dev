import type { Instance } from "../../../../factory";
import type { QuipSet } from "./quip-types.js";
import { createQuipTraverser } from "./quip-picker.js";
import { renderQuip } from "./quip-card-render.js";
import { buildCardElements } from "./quip-card-build.js";
import { lockQuipSize } from "./quip-card-size.js";

const DEFAULT_ROTATE_MS = 20_000;

export interface QuipCardOptions {
    quipSet: QuipSet;
    actions?: readonly Instance[];
    rotateMs?: number;
    extraCardClasses?: readonly string[];
}

export interface QuipCardHandle {
    card: Instance;
    teardown: () => void;
}

export function mountQuipCard(opts: QuipCardOptions): QuipCardHandle {
    const { card, quipEl, moodEl } = buildCardElements(opts.actions, opts.extraCardClasses);
    const traverser = createQuipTraverser(opts.quipSet);
    renderQuip(quipEl, moodEl, traverser);
    const rotateMs = opts.rotateMs ?? DEFAULT_ROTATE_MS;
    const rafId = window.requestAnimationFrame(() => lockQuipSize(quipEl, opts.quipSet));
    const intervalId = window.setInterval(() => renderQuip(quipEl, moodEl, traverser), rotateMs);
    const teardown = (): void => {
        window.cancelAnimationFrame(rafId);
        window.clearInterval(intervalId);
        if (card.el.parentNode !== null) card.destroy();
    };
    return { card, teardown };
}
