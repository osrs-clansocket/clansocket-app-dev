import { button, span } from "../../../factory/content-ops";
import type { Instance } from "../../../factory/core";
import { MAP_ZOOM_BTN_CLASS } from "../../../../shared/constants/clan/clan-map-constants.js";

export function zoomButton(label: string, onClick: () => void, context: string): Instance<HTMLButtonElement> {
    return button(
        {
            onClick,
            context,
            ariaLabel: label,
            variant: "chip",
            
            classes: [MAP_ZOOM_BTN_CLASS],
            meta: ["action"],
        },
        [span({ context: null, meta: null }, [label])],
    );
}
