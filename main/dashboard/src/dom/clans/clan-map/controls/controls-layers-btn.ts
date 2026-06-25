import { button } from "../../../factory/content-ops";
import { icon } from "../../../factory/content-ops/graphics/media.js";
import { effect, type Signal } from "../../../factory/reactive/index.js";
import type { Instance } from "../../../factory/core";
import { MAP_LAYERS_BTN_CLASS } from "../../../../shared/constants/clan/clan-map-constants.js";
import { IS_ACTIVE_CLASS } from "../../../../shared/constants/state-modifier-constants.js";

export function layersButton(mergedLayersVisible$: Signal<boolean>): Instance<HTMLButtonElement> {
    const iconInst = icon({ name: "layers", ariaHidden: true, context: null, meta: null });
    const btn = button(
        {
            ariaLabel: "Toggle layered planes",
            variant: "chip",
            compact: true,
            classes: [MAP_LAYERS_BTN_CLASS],
            onClick: () => mergedLayersVisible$.set(!mergedLayersVisible$()),
            context: "toggle layered planes (ghost-floor underlay)",
            meta: ["action"],
        },
        [iconInst],
    );
    btn.trackDispose(effect(() => btn.el.classList.toggle(IS_ACTIVE_CLASS, mergedLayersVisible$())));
    return btn;
}
