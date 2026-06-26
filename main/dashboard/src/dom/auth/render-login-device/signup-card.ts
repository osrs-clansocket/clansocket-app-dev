import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    heading,
    input,
    label,
    paragraph,
    type Instance,
    baseProps,
    textProps,
} from "../../factory";
import { isPasskeyError, passkeyClient } from "../../../state/passkey/client";
import { DISPLAY_NAME_MAX_LEN } from "../../../state/identity/identity-client/index.js";
import { setStatus, statusLine } from "../status-line.js";
import { FORM_FIELD_LABEL, FORM_INPUT } from "../../forms/form-classes.js";
import {
    ACCOUNT_CARD_CLASS,
    ACCOUNT_SECTION_HINT_CLASS,
    ACCOUNT_SECTION_TITLE_CLASS,
} from "../../../shared/constants/account-constants.js";

function buildNameInput(): Instance<HTMLInputElement> {
    return input({
        classes: [FORM_INPUT],
        ariaLabel: "Your display name",
        type: "text",
        placeholder: "Your display name",
        autocomplete: "off",
        maxlength: String(DISPLAY_NAME_MAX_LEN),
        context: "enter your display name",
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

function persistBackupCodes(result: { backupCodes?: string[] | null; backupCodesFile?: string | null }): void {
    sessionStorage.setItem(
        "clansocket:fresh-backup-codes",
        JSON.stringify({ codes: result.backupCodes ?? [], file: result.backupCodesFile ?? "" }),
    );
}

async function runSignupSubmit(args: {
    nameInput: Instance<HTMLInputElement>;
    deviceInput: Instance<HTMLInputElement>;
    submit: Instance<HTMLButtonElement>;
    status: Instance;
}): Promise<void> {
    const { nameInput, deviceInput, submit, status } = args;
    const display = nameInput.el.value.trim();
    if (display.length === 0) {
        setStatus(status, "Display name required.");
        return;
    }
    setStatus(status, "Creating account + waiting for passkey prompt…");
    submit.el.disabled = true;
    const result = await passkeyClient.signupWithDevice(display, deviceInput.el.value.trim() || null);
    submit.el.disabled = false;
    if (isPasskeyError(result)) {
        setStatus(status, `Signup failed: ${result.message ?? result.error}`);
        return;
    }
    persistBackupCodes(result);
    window.location.assign("/account");
}

function buildSubmitBtn(args: {
    nameInput: Instance<HTMLInputElement>;
    deviceInput: Instance<HTMLInputElement>;
    status: Instance;
}): Instance<HTMLButtonElement> {
    const { nameInput, deviceInput, status } = args;
    const submit: Instance<HTMLButtonElement> = button({
        variant: BTN_VARIANT_OUTLINE,

        text: "Create account + add this device",
        context: "create your account and register a passkey for this device",
        meta: ["action", "account"],
        onClick: () => void runSignupSubmit({ nameInput, deviceInput, submit, status }),
    });
    return submit;
}

function buildSignupHeader(): Instance[] {
    return [
        heading("h3", {
            classes: [ACCOUNT_SECTION_TITLE_CLASS],
            text: "Add device passkey",
            context: null,
            meta: null,
        }),
        paragraph(
            textProps(
                [ACCOUNT_SECTION_HINT_CLASS],
                "Pick a display name + register a passkey for this device. Backup codes will be shown once on the next page.",
            ),
        ),
    ];
}

export function buildSignupCard(): Instance {
    const status = statusLine();
    const nameInput = buildNameInput();
    const deviceInput = buildDeviceInput();
    const submit = buildSubmitBtn({ nameInput, deviceInput, status });
    return div(baseProps([ACCOUNT_CARD_CLASS]), [
        ...buildSignupHeader(),
        label(textProps([FORM_FIELD_LABEL], "Display name")),
        nameInput,
        label(textProps([FORM_FIELD_LABEL], "Device name (optional)")),
        deviceInput,
        submit,
        status,
    ]);
}
