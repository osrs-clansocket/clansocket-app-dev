import { button, span } from "../../../factory/content-ops";
import type { Instance } from "../../../factory/core";
import { MAP_RESET_BTN_CLASS } from "../../../../shared/constants/clan/clan-map-constants.js";

export function resetButton(onClick: () => void): Instance<HTMLButtonElement> {
    return button(
        {
            onClick,
            variant: "chip",
            
            classes: [MAP_RESET_BTN_CLASS],
            context: "reset viewport",
            meta: ["action"],
        },
        [span({ context: null, meta: null }, ["fit"])],
    );
}
