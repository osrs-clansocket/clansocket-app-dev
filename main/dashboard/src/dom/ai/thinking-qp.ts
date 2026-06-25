import { createInstance, snapshot } from "../factory";

export const QP_FIRE_DELAY = 200;
export const QP_ROLL = 0.08;
export const QP_SEQUENCE = ["q p", "   W", "...damn it."] as const;

const QP_STEP_MS = 150;

function setLabelText(l: HTMLSpanElement, text: string): void {
    createInstance(l).setText(snapshot(text));
}

export function fireQpSequence(getLabel: () => HTMLSpanElement | null): void {
    const first = getLabel();
    if (first) setLabelText(first, QP_SEQUENCE[0]!);
    setTimeout(() => {
        const l = getLabel();
        if (l) setLabelText(l, QP_SEQUENCE[1]!);
    }, QP_STEP_MS);
    setTimeout(() => {
        const l = getLabel();
        if (l) setLabelText(l, QP_SEQUENCE[2]!);
    }, QP_STEP_MS * 2);
}
