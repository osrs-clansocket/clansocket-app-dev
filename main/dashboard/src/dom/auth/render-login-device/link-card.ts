import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    heading,
    input,
    label,
    paragraph,
    snapshot,
    type Instance,
    baseProps,
    textProps,
} from "../../factory";
import { isPasskeyError, passkeyClient, LINK_CODE_DIGITS } from "../../../state/passkey/client";
import { setStatus, statusLine } from "../status-line.js";
import { FORM_FIELD_LABEL, FORM_INPUT } from "../../forms/form-classes.js";
import {
    ACCOUNT_CARD_CLASS,
    ACCOUNT_SECTION_HINT_CLASS,
    ACCOUNT_SECTION_TITLE_CLASS,
} from "../../../shared/constants/account-constants.js";

function buildCodeInput(): Instance<HTMLInputElement> {
    return input({
        classes: [FORM_INPUT],
        ariaLabel: `${LINK_CODE_DIGITS}-digit link code`,
        type: "text",
        placeholder: `${LINK_CODE_DIGITS}-digit code`,
        autocomplete: "off",
        maxlength: String(LINK_CODE_DIGITS),
        inputmode: "numeric",
        context: "enter the device-link code from your existing device",
        meta: ["input", "device"],
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

async function runLinkSubmit(
    codeInput: Instance<HTMLInputElement>,
    deviceInput: Instance<HTMLInputElement>,
    submit: Instance<HTMLButtonElement>,
    status: Instance,
): Promise<void> {
    const code = codeInput.el.value.trim();
    if (code.length === 0) {
        setStatus(status, "Link code required.");
        return;
    }
    setStatus(status, "Verifying code + waiting for passkey prompt…");
    submit.el.disabled = true;
    const result = await passkeyClient.redeemRegisterCode(code, deviceInput.el.value.trim() || null);
    submit.el.disabled = false;
    if (isPasskeyError(result)) {
        setStatus(status, `Link failed: ${result.message ?? result.error}`);
        return;
    }
    window.location.assign("/account");
}

function buildLinkHint(): Instance {
    return paragraph(
        textProps(
            [ACCOUNT_SECTION_HINT_CLASS],
            snapshot(
                `On the device that already has access: account → sign-in devices → Link code. Paste the ${LINK_CODE_DIGITS} digits here.`,
            ),
        ),
    );
}

function buildLinkBtn(args: {
    codeInput: Instance<HTMLInputElement>;
    deviceInput: Instance<HTMLInputElement>;
    status: Instance;
}): Instance<HTMLButtonElement> {
    const { codeInput, deviceInput, status } = args;
    const submit: Instance<HTMLButtonElement> = button({
        variant: BTN_VARIANT_OUTLINE,
        
        text: "Link this device",
        context: "link this device to your existing account",
        meta: ["action", "device"],
        onClick: () => runLinkSubmit(codeInput, deviceInput, submit, status),
    });
    return submit;
}

export function buildLinkCard(): Instance {
    const status = statusLine();
    const codeInput = buildCodeInput();
    const deviceInput = buildDeviceInput();
    const submit = buildLinkBtn({ codeInput, deviceInput, status });
    return div(baseProps([ACCOUNT_CARD_CLASS]), [
        heading("h3", {
            classes: [ACCOUNT_SECTION_TITLE_CLASS],
            text: "Link this device to an existing account",
            context: null,
            meta: null,
        }),
        buildLinkHint(),
        label(textProps([FORM_FIELD_LABEL], "Link code")),
        codeInput,
        label(textProps([FORM_FIELD_LABEL], "Device name (optional)")),
        deviceInput,
        submit,
        status,
    ]);
}
