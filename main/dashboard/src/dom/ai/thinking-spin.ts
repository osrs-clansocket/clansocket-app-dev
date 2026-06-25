import { createInstance, snapshot } from "../factory";
import { setDynProp } from "../../state/dynamic-styles";
import { AI_BAR_THINK_ICON_CLASS, AI_BAR_THINK_LABEL_CLASS } from "../../shared/constants/ai-bar-constants.js";
import { randomIcon } from "./thinking-icons.js";

const SPIN_SETTLE_MS = 300;

export function spinIn(icon: HTMLImageElement, label: HTMLSpanElement, text: string): void {
    const src = randomIcon();
    icon.src = src || "";
    setDynProp(icon, "display", src ? "" : "none");
    icon.classList.remove(`${AI_BAR_THINK_ICON_CLASS}--out`);
    icon.classList.add(`${AI_BAR_THINK_ICON_CLASS}--in`);
    createInstance(label).setText(snapshot(text));
    label.classList.remove(`${AI_BAR_THINK_LABEL_CLASS}--out`);
    label.classList.add(`${AI_BAR_THINK_LABEL_CLASS}--in`);
    setTimeout(() => {
        icon.classList.remove(`${AI_BAR_THINK_ICON_CLASS}--in`);
        label.classList.remove(`${AI_BAR_THINK_LABEL_CLASS}--in`);
    }, SPIN_SETTLE_MS);
}
