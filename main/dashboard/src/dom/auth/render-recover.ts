import {
    BTN_VARIANT_PRIMARY,
    button,
    div,
    heading,
    input,
    label,
    paragraph,
    type Instance,
    baseProps,
    textProps,
} from "../factory";
import { isPasskeyError, passkeyClient } from "../../state/passkey/client";
import { identityClient } from "../../state/identity/identity-client/index.js";
import { setStatus } from "./status-line.js";
import { FORM_FIELD_LABEL, FORM_INPUT } from "../forms/form-classes.js";
import {
    ACCOUNT_CARD_CLASS,
    ACCOUNT_EMPTY_CLASS,
    ACCOUNT_SECTION_HINT_CLASS,
    ACCOUNT_SECTION_TITLE_CLASS,
} from "../../shared/constants/account-constants.js";
import { ROUTE_ACCOUNT_CLASS, ROUTE_ROOT_CLASS } from "../../shared/constants/route/route-constants.js";

function buildCodeInput(): Instance<HTMLInputElement> {
    return input({
        classes: [FORM_INPUT],
        ariaLabel: "Backup code",
        type: "text",
        placeholder: "XXXX-XXXX-XXXX-XXXX",
        autocomplete: "off",
        maxlength: "19",
        context: "enter your backup code",
        meta: ["input", "account"],
    });
}

function buildDeviceInput(): Instance<HTMLInputElement> {
    return input({
        classes: [FORM_INPUT],
        ariaLabel: "This device's name (optional)",
        type: "text",
        placeholder: "This device's name (optional)",
        autocomplete: "off",
        maxlength: "64",
        context: "name for this device (optional)",
        meta: ["input", "device"],
    });
}

async function runRecover(
    codeInput: Instance<HTMLInputElement>,
    deviceInput: Instance<HTMLInputElement>,
    submit: Instance<HTMLButtonElement>,
    status: Instance,
): Promise<void> {
    const code = codeInput.el.value.trim();
    if (code.length === 0) {
        setStatus(status, "Backup code required.");
        return;
    }
    setStatus(status, "Verifying backup code + waiting for passkey prompt…");
    submit.el.disabled = true;
    const result = await passkeyClient.recoverCode(code, deviceInput.el.value.trim() || null);
    submit.el.disabled = false;
    if (isPasskeyError(result)) {
        setStatus(status, `Recovery failed: ${result.message ?? result.error}`);
        return;
    }
    setStatus(status, "Recovered. Redirecting…");
    window.location.assign("/account");
}

function buildRecoverForm(): Instance {
    const status = paragraph(textProps([ACCOUNT_EMPTY_CLASS], ""));
    status.el.hidden = true;
    const codeInput = buildCodeInput();
    const deviceInput = buildDeviceInput();
    const submit: Instance<HTMLButtonElement> = button({
        variant: BTN_VARIANT_PRIMARY,

        text: "Recover account",
        context: "recover your account using the backup code",
        meta: ["action", "account"],
        onClick: () => runRecover(codeInput, deviceInput, submit, status),
    });
    return div(baseProps([ACCOUNT_CARD_CLASS]), [
        label(textProps([FORM_FIELD_LABEL], "Backup code")),
        codeInput,
        label(textProps([FORM_FIELD_LABEL], "Device name (optional)")),
        deviceInput,
        submit,
        status,
    ]);
}

async function renderRecover(): Promise<Instance> {
    const session = await identityClient.session().catch(() => null);
    if (session !== null) {
        window.location.assign("/account");
        return div({ context: null, meta: null });
    }
    return div(baseProps([ROUTE_ROOT_CLASS, ROUTE_ACCOUNT_CLASS]), [
        heading("h2", { classes: [ACCOUNT_SECTION_TITLE_CLASS], text: "Recover account", context: null, meta: null }),
        paragraph(
            textProps(
                [ACCOUNT_SECTION_HINT_CLASS],
                "Paste a backup code from the .txt file u downloaded when u signed up. A fresh passkey will be registered for this device + attached to ur account.",
            ),
        ),
        buildRecoverForm(),
    ]);
}

export { renderRecover };
