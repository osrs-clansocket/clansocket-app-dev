import { input, paragraph } from "../../../../../factory/content-ops/index.js";
import type { Instance } from "../../../../../factory/core/index.js";
import { listProviders } from "../../../../../../ai/vault/vault/index.js";
import { getProviderConfig } from "../../../../../../ai/vault/session.js";
import {
    ERROR_CLASS,
    INPUT_CLASS,
    PASSWORD_TYPE,
    TOKEN_DEFAULT,
    type KeySettingsOpts,
    type UnlockedSub,
} from "../constants.js";
import { buildPriorityField, buildTokensField } from "./numeric-fields.js";
import { providerFields } from "./provider-model-fields.js";

export interface EditorViewArgs {
    bodyHost: HTMLElement;
    footerHost: HTMLElement;
    sub: UnlockedSub;
    setSub: (next: UnlockedSub) => void;
    rerender: () => Promise<void>;
    opts: KeySettingsOpts;
}

export interface EditorModel {
    isEdit: boolean;
    editingProvider: string | null;
    existingConfig: Awaited<ReturnType<typeof getProviderConfig>> | null;
    providerModel: ReturnType<typeof providerFields>;
    keyInput: Instance<HTMLInputElement>;
    tokens: ReturnType<typeof buildTokensField>;
    priority: ReturnType<typeof buildPriorityField>;
    errorEl: Instance;
    showError: (msg: string) => void;
}

function buildKeyInput(existingConfig: { apiKey: string } | null): Instance<HTMLInputElement> {
    const keyInput = input({
        classes: [INPUT_CLASS],
        ariaLabel: "API key",
        type: PASSWORD_TYPE,
        autocomplete: "off",
        placeholder: "sk-...",
        context: "enter the API key for this provider",
        meta: ["input"],
    });
    if (existingConfig) keyInput.el.value = existingConfig.apiKey;
    return keyInput;
}

function buildEditorError(): { errorEl: Instance; showError: (msg: string) => void } {
    const errorEl = paragraph({ classes: [ERROR_CLASS], context: null, meta: null });
    errorEl.el.hidden = true;
    const showError = (msg: string): void => {
        errorEl.setText(msg);
        errorEl.el.hidden = false;
    };
    return { errorEl, showError };
}

export async function buildEditorModel(sub: UnlockedSub): Promise<EditorModel> {
    const allProviders = await listProviders();
    const isEdit = sub.mode === "edit";
    const editingProvider = sub.mode === "edit" ? sub.provider : null;
    const existingConfig = editingProvider ? await getProviderConfig(editingProvider) : null;
    const initialIndex = editingProvider ? allProviders.indexOf(editingProvider) : allProviders.length;
    const totalAfter = isEdit ? allProviders.length : allProviders.length + 1;
    const providerModel = providerFields({ isEdit, editingProvider, allProviders, existingConfig });
    const keyInput = buildKeyInput(existingConfig);
    const tokens = buildTokensField(existingConfig?.maxTokens ?? TOKEN_DEFAULT);
    const priority = buildPriorityField(initialIndex, totalAfter);
    const { errorEl, showError } = buildEditorError();
    return { isEdit, editingProvider, existingConfig, providerModel, keyInput, tokens, priority, errorEl, showError };
}
