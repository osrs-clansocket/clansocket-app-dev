import { div } from "../../../factory/layout-ops/index.js";
import { BTN_VARIANT_OUTLINE, button, form } from "../../../factory/content-ops/index.js";
import type { Instance } from "../../../factory/core/index.js";
import { setupVault, VaultPassphraseError } from "../../../../ai/vault/vault/index.js";
import { setActiveKey } from "../../../../ai/vault/session.js";
import { buildCreateBtn, buildSetupChrome, buildSetupInputs, type VaultSetupInputs } from "./vault-setup-fields.js";
import {
    FORM_CLAIM_FORM as FORM_CLASS,
    FORM_FORM_ROW as FORM_ROW_CLASS,
    FORM_FORM_ROW_FILL as FORM_ROW_FILL_CLASS,
} from "../../../forms/form-classes.js";

export interface VaultSetupHandle {
    el: HTMLElement;
    destroy: () => void;
}

export interface VaultSetupOpts {
    onReady?: () => void;
    onCancel?: () => void;
}

function describeError(err: unknown): string {
    if (err instanceof VaultPassphraseError) return err.message;
    if (err instanceof Error) return err.message;
    return String(err);
}

function buildButtonRow(opts: VaultSetupOpts, submitBtn: Instance<HTMLButtonElement>): Instance {
    if (!opts.onCancel) return div({ classes: [FORM_ROW_CLASS], context: null, meta: null }, [submitBtn]);
    return div({ classes: [FORM_ROW_CLASS, FORM_ROW_FILL_CLASS], context: null, meta: null }, [
        submitBtn,
        button({
            variant: BTN_VARIANT_OUTLINE,
            compact: true,
            type: "button",
            text: "Cancel",
            context: "cancel vault setup",
            meta: ["action"],
            onClick: () => opts.onCancel?.(),
        }),
    ]);
}

async function submitVaultSetup(
    inputs: VaultSetupInputs,
    opts: VaultSetupOpts,
    showError: (m: string) => void,
): Promise<void> {
    const pass = inputs.passInput.el.value;
    const confirm = inputs.confirmInput.el.value;
    if (pass !== confirm) {
        showError("Passphrases do not match");
        return;
    }
    try {
        const derived = await setupVault(pass);
        setActiveKey(derived);
        opts.onReady?.();
    } catch (err) {
        showError(describeError(err));
    }
}

function buildSetupForm(
    inputs: VaultSetupInputs,
    buttonRow: Instance,
    handleSubmit: () => Promise<void>,
    showError: (m: string) => void,
): Instance {
    const passRow = div({ classes: [FORM_ROW_CLASS, FORM_ROW_FILL_CLASS], context: null, meta: null }, [
        inputs.passInput,
        inputs.confirmInput,
    ]);
    return form(
        {
            classes: [FORM_CLASS],
            context: "vault setup form — submit to create the encrypted key vault",
            meta: ["submit"],
            onSubmit: (e: SubmitEvent) => {
                e.preventDefault();
                handleSubmit().catch((err) => showError(describeError(err)));
            },
        },
        [inputs.usernameInput, passRow, buttonRow],
    );
}

function renderVaultSetup(bodyHost: HTMLElement, footerHost: HTMLElement, opts: VaultSetupOpts = {}): VaultSetupHandle {
    const { helpEl, errorEl, showError } = buildSetupChrome();
    const inputs = buildSetupInputs();
    const handleSubmit = async (): Promise<void> => {
        errorEl.el.hidden = true;
        await submitVaultSetup(inputs, opts, showError);
    };
    const submitBtn = buildCreateBtn();
    helpEl.mount(bodyHost);
    errorEl.mount(bodyHost);
    const footerForm = buildSetupForm(inputs, buildButtonRow(opts, submitBtn), handleSubmit, showError);
    footerForm.mount(footerHost);
    return {
        el: footerForm.el,
        destroy: () => {
            helpEl.destroy();
            errorEl.destroy();
            footerForm.destroy();
        },
    };
}

export { renderVaultSetup };
