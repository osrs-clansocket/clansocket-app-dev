import { input } from "../../../../../factory/content-ops/index.js";
import type { Instance } from "../../../../../factory/core/index.js";
import { buildGlassSelect, type SelectOption } from "../../../../../forms/glass/inputs/select/index.js";
import { modelsForProvider } from "../../../known-providers.js";
import { CUSTOM_MODEL, CUSTOM_PROVIDER, INPUT_CLASS } from "../constants.js";

export function buildCustomInput(): ReturnType<typeof input> {
    return input({
        classes: [INPUT_CLASS],
        ariaLabel: "Custom model name",
        type: "text",
        autocomplete: "off",
        placeholder: "Model name",
        context: "enter a custom model name",
        meta: ["input"],
    });
}

function applyInitialCustom(
    initial: string,
    currentModel: string | undefined,
    customModelInput: ReturnType<typeof input>,
): void {
    if (initial === CUSTOM_MODEL) {
        customModelInput.el.value = currentModel ?? "";
        customModelInput.el.hidden = false;
    } else {
        customModelInput.el.hidden = true;
    }
}

function pickInitialModel(
    currentIsKnown: boolean,
    currentModel: string | undefined,
    availableModels: readonly string[],
): string {
    if (currentIsKnown && currentModel) return currentModel;
    if (currentModel) return CUSTOM_MODEL;
    return availableModels[0]!;
}

interface MountModelArgs {
    modelHost: Instance;
    availableModels: readonly string[];
    currentModel: string | undefined;
    customModelInput: ReturnType<typeof input>;
    valueGetterRef: { fn: () => string };
}

function mountModelSelect({
    modelHost,
    availableModels,
    currentModel,
    customModelInput,
    valueGetterRef,
}: MountModelArgs): void {
    const modelOptions: SelectOption[] = availableModels.map((m) => ({ value: m, label: m }));
    modelOptions.push({ value: CUSTOM_MODEL, label: "Custom…" });
    const currentIsKnown = currentModel ? availableModels.includes(currentModel) : false;
    const initial = pickInitialModel(currentIsKnown, currentModel, availableModels);
    const modelSelect = buildGlassSelect("model", modelOptions, initial);
    modelSelect.mount(modelHost.el);
    customModelInput.mount(modelHost.el);
    const modelHidden = modelSelect.el.querySelector<HTMLInputElement>('input[type="hidden"]')!;
    applyInitialCustom(initial, currentModel, customModelInput);
    modelHidden.addEventListener("change", () => {
        customModelInput.el.hidden = modelHidden.value !== CUSTOM_MODEL;
    });
    valueGetterRef.fn = () =>
        modelHidden.value === CUSTOM_MODEL ? customModelInput.el.value.trim() : modelHidden.value;
}

interface RebuildArgs {
    modelHost: Instance;
    providerHidden: HTMLInputElement;
    customInput: Instance<HTMLInputElement>;
    existingConfig: { model?: string } | null;
    valueGetterRef: { fn: () => string };
}

export function makeModelRebuild(args: RebuildArgs): () => void {
    const { modelHost, providerHidden, customInput, existingConfig, valueGetterRef } = args;
    return (): void => {
        modelHost.clear();
        const providerValue = providerHidden.value;
        const effectiveProvider =
            providerValue === CUSTOM_PROVIDER ? customInput.el.value.trim().toLowerCase() : providerValue;
        const availableModels = effectiveProvider ? modelsForProvider(effectiveProvider) : [];
        const currentModel = existingConfig?.model;
        const customModelInput = buildCustomInput();
        if (availableModels.length === 0) {
            if (currentModel) customModelInput.el.value = currentModel;
            customModelInput.mount(modelHost.el);
            valueGetterRef.fn = () => customModelInput.el.value.trim();
            return;
        }
        mountModelSelect({ modelHost, availableModels, currentModel, customModelInput, valueGetterRef });
    };
}
