import { BTN_VARIANT_BARE, button, type Instance } from "../../../../factory/index.js";
import { buildSelectChevron } from "./chevron.js";

const CLASS_TRIGGER = "glass-select__trigger";

export function buildSelectTrigger(labelInst: Instance): Instance {
    return button(
        {
            variant: BTN_VARIANT_BARE,
            ariaLabel: "Open select",
            classes: [CLASS_TRIGGER],
            ariaHaspopup: "listbox",
            context: "open the select dropdown",
            meta: ["action", "choice"],
        },
        [labelInst, buildSelectChevron()],
    );
}
