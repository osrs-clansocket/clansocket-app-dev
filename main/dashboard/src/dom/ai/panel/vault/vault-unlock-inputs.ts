import { BTN_VARIANT_OUTLINE, button, input } from "../../../factory/content-ops/index.js";
import type { Instance } from "../../../factory/core/index.js";
import { FORM_INPUT as INPUT_CLASS, VAULT_USERNAME } from "../../../forms/form-classes.js";

const PASSWORD_TYPE = "password";

function buildUsernameInput(): Instance<HTMLInputElement> {
    return input({
        ariaLabel: "Vault username",
        ariaHidden: "true",
        type: "text",
        autocomplete: "username",
        value: VAULT_USERNAME,
        readonly: "",
        hidden: "",
        tabindex: "-1",
        context: "hidden username field for password managers",
        meta: ["input"],
    });
}

function buildPassInput(): Instance<HTMLInputElement> {
    return input({
        classes: [INPUT_CLASS],
        ariaLabel: "Vault passphrase",
        type: PASSWORD_TYPE,
        autocomplete: "current-password",
        placeholder: "Passphrase",
        context: "enter your vault passphrase to unlock",
        meta: ["input"],
    });
}

function buildUnlockBtn(): Instance<HTMLButtonElement> {
    return button({
        variant: BTN_VARIANT_OUTLINE,
        
        type: "submit",
        text: "Unlock",
        context: "unlock the encrypted key vault",
        meta: ["submit"],
    });
}

export function buildUnlockInputs(): {
    usernameInput: Instance<HTMLInputElement>;
    passInput: Instance<HTMLInputElement>;
    submitBtn: Instance<HTMLButtonElement>;
} {
    return { usernameInput: buildUsernameInput(), passInput: buildPassInput(), submitBtn: buildUnlockBtn() };
}
