import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    effect,
    input,
    paragraph,
    type Instance,
    baseProps,
    textProps,
} from "../../../factory/index.js";
import { isPasskeyError, passkeyClient } from "../../../../state/passkey/client/index.js";
import { devicesStore } from "../../../../state/passkey/stores/devices-store.js";
import { createDevicesRenderer } from "./devices-renderer.js";
import { buildDeviceRow } from "./devices-row.js";
import { ACCOUNT_LIST_CLASS } from "../../../../shared/constants/account-constants.js";
import { setStatus } from "../../status-line.js";
import { FORM_FORM_ROW, FORM_HINT, FORM_INPUT } from "../../../forms/form-classes.js";
import { accountPanel } from "../account-panel.js";
import { defineAccountPanel } from "../registry.js";

async function runAttachPasskey(
    btn: Instance<HTMLButtonElement>,
    nameInput: Instance<HTMLInputElement>,
    status: Instance,
    refresh: () => void,
): Promise<void> {
    setStatus(status, "Waiting for browser passkey prompt…");
    btn.el.disabled = true;
    const result = await passkeyClient.attachPasskey(nameInput.el.value.trim() || null);
    btn.el.disabled = false;
    if (isPasskeyError(result)) {
        setStatus(status, `Failed: ${result.message ?? result.error}`);
        return;
    }
    setStatus(status, "Passkey registered.");
    nameInput.el.value = "";
    refresh();
}

async function runCreateCode(btn: Instance<HTMLButtonElement>, status: Instance): Promise<void> {
    btn.el.disabled = true;
    const res = await passkeyClient.createLinkCode();
    btn.el.disabled = false;
    setStatus(status, isPasskeyError(res) ? `failed: ${res.message ?? res.error}` : `code: ${res.code} (5 min)`);
}

function buildNameInput(): Instance<HTMLInputElement> {
    return input({
        classes: [FORM_INPUT],
        ariaLabel: "This device name",
        type: "text",
        placeholder: "This device name",
        autocomplete: "off",
        maxlength: "64",
        context: "name for this device when registering a passkey",
        meta: ["input", "device"],
    });
}

function buildDevicesFooter(refresh: () => void, status: Instance): Instance {
    const deviceInput = buildNameInput();
    const addBtn: Instance<HTMLButtonElement> = button({
        variant: BTN_VARIANT_OUTLINE,

        text: "Add",
        context: "register a passkey on this device",
        meta: ["action", "device"],
        onClick: () => runAttachPasskey(addBtn, deviceInput, status, refresh),
    });
    const linkBtn: Instance<HTMLButtonElement> = button({
        variant: BTN_VARIANT_OUTLINE,

        text: "Link",
        context: "generate a device-link code to add another device",
        meta: ["action", "device"],
        onClick: () => runCreateCode(linkBtn, status),
    });
    return div(baseProps([FORM_FORM_ROW]), [deviceInput, addBtn, linkBtn]);
}

defineAccountPanel({ key: "devices", order: 30, build: () => buildDevicesPanel() });

export function buildDevicesPanel(): Instance {
    const devicesHost = div(baseProps([ACCOUNT_LIST_CLASS]));
    const status = paragraph(textProps([FORM_HINT], ""));
    status.el.hidden = true;
    const onRevoked = (msg: string | null): void => {
        if (msg !== null) {
            setStatus(status, msg);
            return;
        }
        setStatus(status, "");
        void devicesStore.refresh();
    };
    const root = accountPanel({
        title: "Sign-in devices",
        body: [devicesHost, status],
        footer: [buildDevicesFooter(() => void devicesStore.refresh(), status)],
    });
    const renderer = createDevicesRenderer(devicesHost, (d) => buildDeviceRow(d, onRevoked));
    root.trackDispose(effect(() => renderer.render(devicesStore.list$())));
    return root;
}
