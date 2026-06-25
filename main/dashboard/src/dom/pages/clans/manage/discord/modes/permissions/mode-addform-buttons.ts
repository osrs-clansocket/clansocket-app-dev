import { BTN_VARIANT_BARE, button, type Instance } from "../../../../../../factory";
import { ADD_FORM_BTN_CLASS } from "./mode-constants.js";

export function buildAddButtons(onClose: () => void): {
    cancelBtn: Instance<HTMLButtonElement>;
    submitBtn: Instance<HTMLButtonElement>;
} {
    const cancelBtn = button({
        classes: [ADD_FORM_BTN_CLASS],
        variant: BTN_VARIANT_BARE,
        text: "Cancel",
        ariaLabel: "Cancel add override",
        context: "cancel add-override slide panel",
        meta: ["action"],
        onClick: onClose,
    });
    const submitBtn = button({
        classes: [ADD_FORM_BTN_CLASS],
        variant: BTN_VARIANT_BARE,
        text: "Add",
        ariaLabel: "Add override",
        context: "submit add-override",
        meta: ["submit"],
    });
    return { cancelBtn, submitBtn };
}
