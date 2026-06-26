import { button, span } from "../../../factory/content-ops";
import { effect, type Signal } from "../../../factory/reactive/index.js";
import type { Instance } from "../../../factory/core";
import { IS_ACTIVE_CLASS } from "../../../../shared/constants/state-modifier-constants.js";

export interface ToggleSpec {
    klass: string;
    signal$: Signal<boolean>;
    label: string;
    context: string;
    ariaLabel?: string;
}

export function toggleChip(spec: ToggleSpec): Instance<HTMLButtonElement> {
    const btn = button(
        {
            ariaLabel: spec.ariaLabel,
            variant: "chip",
            
            classes: [spec.klass],
            onClick: () => spec.signal$.set(!spec.signal$()),
            context: spec.context,
            meta: ["action"],
        },
        [span({ context: null, meta: null }, [spec.label])],
    );
    btn.trackDispose(effect(() => btn.el.classList.toggle(IS_ACTIVE_CLASS, spec.signal$())));
    return btn;
}
