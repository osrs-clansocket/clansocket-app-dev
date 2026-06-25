import { div } from "../../../factory/layout-ops/index.js";
import { BTN_VARIANT_OUTLINE, button, form, paragraph } from "../../../factory/content-ops/index.js";
import type { Instance } from "../../../factory/core/index.js";
import { unlockVault, VaultDecryptError, VaultMissingError } from "../../../../ai/vault/vault/index.js";
import { setActiveKey } from "../../../../ai/vault/session.js";
import {
    FORM_CLAIM_FORM as FORM_CLASS,
    FORM_ERROR as ERROR_CLASS,
    FORM_FORM_ROW as FORM_ROW_CLASS,
    FORM_HINT as HINT_CLASS,
} from "../../../forms/form-classes.js";
import { buildUnlockInputs } from "./vault-unlock-inputs.js";

export interface VaultUnlockHandle {
    el: HTMLElement;
    destroy: () => void;
}

export interface VaultUnlockOpts {
    onUnlocked?: () => void;
    onCancel?: () => void;
}

function describeError(err: unknown): string {
    if (err instanceof VaultDecryptError) return "Wrong passphrase";
    if (err instanceof VaultMissingError) return "Vault not set up";
    if (err instanceof Error) return err.message;
    return String(err);
}

interface UnlockChrome {
    helpEl: Instance;
    errorEl: Instance;
    showError: (msg: string) => void;
}

function buildUnlockChrome(): UnlockChrome {
    const helpEl = paragraph({
        classes: [HINT_CLASS],
        text: "Encrypted store for ur AI provider keys.",
        context: null,
        meta: null,
    });
    const errorEl = paragraph({ classes: [ERROR_CLASS], context: null, meta: null });
    errorEl.el.hidden = true;
    const showError = (message: string): void => {
        errorEl.setText(message);
        errorEl.el.hidden = false;
    };
    return { helpEl, errorEl, showError };
}

function buildInputRow(args: { passInput: Instance; submitBtn: Instance; opts: VaultUnlockOpts }): Instance {
    const { passInput, submitBtn, opts } = args;
    if (!opts.onCancel) return div({ classes: [FORM_ROW_CLASS], context: null, meta: null }, [passInput, submitBtn]);
    const cancelBtn = button({
        variant: BTN_VARIANT_OUTLINE,
        compact: true,
        type: "button",
        text: "Cancel",
        context: "cancel unlocking the vault",
        meta: ["action"],
        onClick: () => opts.onCancel?.(),
    });
    return div({ classes: [FORM_ROW_CLASS], context: null, meta: null }, [passInput, submitBtn, cancelBtn]);
}

function makeUnlockSubmit(args: {
    passInput: Instance<HTMLInputElement>;
    opts: VaultUnlockOpts;
    chrome: UnlockChrome;
}): () => Promise<void> {
    const { passInput, opts, chrome } = args;
    return async (): Promise<void> => {
        chrome.errorEl.el.hidden = true;
        try {
            const derived = await unlockVault(passInput.el.value);
            setActiveKey(derived);
            opts.onUnlocked?.();
        } catch (err) {
            chrome.showError(describeError(err));
        }
    };
}

function buildUnlockForm(args: {
    chrome: UnlockChrome;
    usernameInput: Instance;
    inputRow: Instance;
    handleSubmit: () => Promise<void>;
}): Instance {
    const { chrome, usernameInput, inputRow, handleSubmit } = args;
    return form(
        {
            classes: [FORM_CLASS],
            context: "vault unlock form — submit to decrypt the key vault",
            meta: ["submit"],
            onSubmit: (e: SubmitEvent) => {
                e.preventDefault();
                handleSubmit().catch((err) => chrome.showError(describeError(err)));
            },
        },
        [usernameInput, inputRow],
    );
}

function renderVaultUnlock(
    bodyHost: HTMLElement,
    footerHost: HTMLElement,
    opts: VaultUnlockOpts = {},
): VaultUnlockHandle {
    const chrome = buildUnlockChrome();
    const { usernameInput, passInput, submitBtn } = buildUnlockInputs();
    const handleSubmit = makeUnlockSubmit({ passInput, opts, chrome });
    chrome.helpEl.mount(bodyHost);
    chrome.errorEl.mount(bodyHost);
    const inputRow = buildInputRow({ passInput, submitBtn, opts });
    const footerForm = buildUnlockForm({ chrome, usernameInput, inputRow, handleSubmit });
    footerForm.mount(footerHost);
    return {
        el: footerForm.el,
        destroy: () => {
            chrome.helpEl.destroy();
            chrome.errorEl.destroy();
            footerForm.destroy();
        },
    };
}

export { renderVaultUnlock };
