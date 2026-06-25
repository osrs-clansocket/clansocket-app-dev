import type { CardBodyState } from "../../../../dom/pages/clans/manage/discord/modes/auto-hooks/card/card-body.js";

export function previewingChange<K extends keyof CardBodyState>(
    state: CardBodyState,
    key: K,
    publishPreview: () => void,
): (v: CardBodyState[K]) => void {
    return (v) => {
        state[key] = v;
        publishPreview();
    };
}

export function silentChange<K extends keyof CardBodyState>(
    state: CardBodyState,
    key: K,
): (v: CardBodyState[K]) => void {
    return (v) => {
        state[key] = v;
    };
}
