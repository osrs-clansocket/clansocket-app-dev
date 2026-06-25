import { BTN_VARIANT_OUTLINE, button, input, paragraph } from "../../../factory/content-ops/index.js";
import type { Instance } from "../../../factory/core/index.js";
import { MIN_PASSPHRASE_LENGTH } from "../../../../ai/vault/vault/index.js";
import {
    FORM_ERROR as ERROR_CLASS,
    FORM_HINT as HINT_CLASS,
    FORM_INPUT as INPUT_CLASS,
    VAULT_USERNAME,
} from "../../../forms/form-classes.js";

const PASSWORD_TYPE = "password";

export interface VaultSetupInputs {
    usernameInput: Instance<HTMLInputElement>;
    passInput: Instance<HTMLInputElement>;
    confirmInput: Instance<HTMLInputElement>;
}

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

export function buildSetupInputs(): VaultSetupInputs {
    const usernameInput = buildUsernameInput();
    const passInput = input({
        classes: [INPUT_CLASS],
        ariaLabel: "Vault passphrase",
        type: PASSWORD_TYPE,
        autocomplete: "new-password",
        placeholder: "Passphrase",
        context: "enter a passphrase to encrypt your key vault",
        meta: ["input"],
    });
    const confirmInput = input({
        classes: [INPUT_CLASS],
        ariaLabel: "Confirm passphrase",
        type: PASSWORD_TYPE,
        autocomplete: "new-password",
        placeholder: "Confirm passphrase",
        context: "confirm the vault passphrase",
        meta: ["input"],
    });
    return { usernameInput, passInput, confirmInput };
}

export function buildSetupChrome(): { helpEl: Instance; errorEl: Instance; showError: (m: string) => void } {
    const helpEl = paragraph({
        classes: [HINT_CLASS],
        context: null,
        meta: null,
        text: `Your AI provider keys are stored only in this browser, encrypted with a passphrase. Minimum ${MIN_PASSPHRASE_LENGTH} characters. If you lose this passphrase the vault is unrecoverable.`,
    });
    const errorEl = paragraph({ classes: [ERROR_CLASS], context: null, meta: null });
    errorEl.el.hidden = true;
    const showError = (message: string): void => {
        errorEl.setText(message);
        errorEl.el.hidden = false;
    };
    return { helpEl, errorEl, showError };
}

export function buildCreateBtn(): Instance<HTMLButtonElement> {
    return button({
        variant: BTN_VARIANT_OUTLINE,
        compact: true,
        type: "submit",
        text: "Create vault",
        context: "create the encrypted key vault",
        meta: ["submit"],
    });
}
