import { input } from "../../../../../factory/content-ops/index.js";
import type { Instance } from "../../../../../factory/core/index.js";
import { buildGlassSelect, type SelectOption } from "../../../../../forms/glass/inputs/select/index.js";
import { KNOWN_PROVIDERS, providerLabel } from "../../../known-providers.js";
import { CUSTOM_PROVIDER, INPUT_CLASS } from "../constants.js";

function buildProviderOptions(
    isEdit: boolean,
    editingProvider: string | null,
    allProviders: readonly string[],
): SelectOption[] {
    const usedProviders = new Set(allProviders);
    const out: SelectOption[] = [];
    for (const known of KNOWN_PROVIDERS) {
        const isSelf = isEdit && known === editingProvider;
        if (!isSelf && usedProviders.has(known)) continue;
        out.push({ value: known, label: providerLabel(known) });
    }
    out.push({ value: CUSTOM_PROVIDER, label: "Custom" });
    return out;
}

function pickInitialProvider(
    usingCustom: boolean,
    isEdit: boolean,
    editingProvider: string | null,
    providerOptions: readonly { value: string }[],
): string {
    if (usingCustom) return CUSTOM_PROVIDER;
    if (isEdit && editingProvider !== null) return editingProvider;
    return providerOptions[0]?.value ?? CUSTOM_PROVIDER;
}

export interface ProviderShell {
    providerSelect: Instance;
    providerHidden: HTMLInputElement;
    usingCustom: boolean;
}

export function buildProviderShell(args: {
    isEdit: boolean;
    editingProvider: string | null;
    allProviders: string[];
}): ProviderShell {
    const { isEdit, editingProvider, allProviders } = args;
    const providerOptions = buildProviderOptions(isEdit, editingProvider, allProviders);
    const usingCustom = isEdit && editingProvider !== null && !KNOWN_PROVIDERS.includes(editingProvider);
    const initialProviderValue = pickInitialProvider(usingCustom, isEdit, editingProvider, providerOptions);
    const providerSelect = buildGlassSelect("provider", providerOptions, initialProviderValue);
    const providerHidden = providerSelect.el.querySelector<HTMLInputElement>('input[type="hidden"]')!;
    return { providerSelect, providerHidden, usingCustom };
}

interface ProviderInputArgs {
    usingCustom: boolean;
    editingProvider: string | null;
    providerHidden: HTMLInputElement;
    rebuildRef: { fn: () => void };
}

export function buildCustomInput(args: ProviderInputArgs): Instance<HTMLInputElement> {
    const { usingCustom, editingProvider, providerHidden, rebuildRef } = args;
    const customInput = input({
        classes: [INPUT_CLASS],
        ariaLabel: "Custom provider name",
        type: "text",
        autocomplete: "off",
        placeholder: "Custom provider name",
        context: "enter a custom AI provider name",
        meta: ["input"],
        onInput: () => {
            if (providerHidden.value === CUSTOM_PROVIDER) rebuildRef.fn();
        },
    });
    if (usingCustom && editingProvider) customInput.el.value = editingProvider;
    customInput.el.hidden = !usingCustom;
    return customInput;
}
