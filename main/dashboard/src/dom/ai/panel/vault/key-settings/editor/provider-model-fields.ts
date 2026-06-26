import { div } from "../../../../../factory/layout-ops/index.js";
import type { input } from "../../../../../factory/content-ops/index.js";
import type { Instance } from "../../../../../factory/core/index.js";
import { CUSTOM_PROVIDER, FORM_ROW_CLASS, FORM_ROW_FILL_CLASS } from "../constants.js";
import { makeModelRebuild } from "./fields-model.js";
import { buildCustomInput, buildProviderShell } from "./fields-provider.js";
import { baseProps } from "../../../../../factory/index.js";

export interface ProviderConfigSlice {
    apiKey: string;
    maxTokens?: number;
    model?: string;
}

export interface ProviderModelFields {
    providerWrap: ReturnType<typeof div>;
    modelHost: ReturnType<typeof div>;
    providerHidden: HTMLInputElement;
    customInput: ReturnType<typeof input>;
    getModelValue: () => string;
    rebuild: () => void;
    usedProviders: Set<string>;
}

export interface ProviderModelArgs {
    isEdit: boolean;
    editingProvider: string | null;
    allProviders: string[];
    existingConfig: ProviderConfigSlice | null;
}

function makeProviderResult(args: {
    providerSelect: Instance;
    customInput: Instance<HTMLInputElement>;
    modelHost: Instance;
    providerHidden: HTMLInputElement;
    valueGetterRef: { fn: () => string };
    rebuildRef: { fn: () => void };
    allProviders: string[];
}): ProviderModelFields {
    const { providerSelect, customInput, modelHost, providerHidden, valueGetterRef, rebuildRef, allProviders } = args;
    const providerWrap = div(baseProps([FORM_ROW_CLASS, FORM_ROW_FILL_CLASS]), [providerSelect, customInput]);
    return {
        providerWrap,
        modelHost,
        providerHidden,
        customInput,
        getModelValue: () => valueGetterRef.fn(),
        rebuild: () => rebuildRef.fn(),
        usedProviders: new Set(allProviders),
    };
}

function wireCustomToggle(
    providerHidden: HTMLInputElement,
    customInput: { el: HTMLInputElement },
    rebuildRef: { fn: () => void },
): void {
    providerHidden.addEventListener("change", () => {
        customInput.el.hidden = providerHidden.value !== CUSTOM_PROVIDER;
        rebuildRef.fn();
    });
}

export function providerFields(args: ProviderModelArgs): ProviderModelFields {
    const { isEdit, editingProvider, allProviders, existingConfig } = args;
    const { providerSelect, providerHidden, usingCustom } = buildProviderShell({
        isEdit,
        editingProvider,
        allProviders,
    });
    const valueGetterRef = { fn: (() => "") as () => string };
    const rebuildRef = { fn: () => undefined as void };
    const customInput = buildCustomInput({ usingCustom, editingProvider, providerHidden, rebuildRef });
    const modelHost = div(baseProps([FORM_ROW_CLASS]));
    rebuildRef.fn = makeModelRebuild({ modelHost, providerHidden, customInput, existingConfig, valueGetterRef });
    wireCustomToggle(providerHidden, customInput, rebuildRef);
    return makeProviderResult({
        providerSelect,
        customInput,
        modelHost,
        providerHidden,
        valueGetterRef,
        rebuildRef,
        allProviders,
    });
}
