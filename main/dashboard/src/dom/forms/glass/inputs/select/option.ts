import { BTN_VARIANT_BARE, button, type Instance } from "../../../../factory/index.js";

const CLASS_OPTION = "glass-select__option";
const DATA_KEY_VALUE = "value";

export interface SelectOption {
    value: string;
    label: string;
}

export function buildOption(opt: SelectOption, current: string): Instance<HTMLButtonElement> {
    return button({
        variant: BTN_VARIANT_BARE,
        classes: [CLASS_OPTION],
        role: "option",
        data: { [DATA_KEY_VALUE]: opt.value },
        ariaSelected: opt.value === current ? "true" : undefined,
        text: opt.label,
        context: "select this option",
        meta: ["choice"],
    });
}
