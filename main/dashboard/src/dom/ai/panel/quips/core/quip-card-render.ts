import { snapshot, type Instance } from "../../../../factory";
import { MOOD_LABELS } from "./quip-types.js";
import type { QuipTraverser } from "./quip-picker.js";

export function renderQuip(quipEl: Instance, moodEl: Instance, traverser: QuipTraverser): void {
    const quip = traverser.next();
    quipEl.setText(snapshot(quip.text));
    const label = MOOD_LABELS[quip.mood];
    moodEl.setText(snapshot(label));
    moodEl.el.dataset.mood = quip.mood;
    moodEl.el.style.visibility = label === "" ? "hidden" : "visible";
}
