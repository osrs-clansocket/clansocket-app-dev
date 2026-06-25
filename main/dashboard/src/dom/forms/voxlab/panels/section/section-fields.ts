import {
    createColorInput,
    createSliderInput,
    createToggleInput,
} from "../../../../../voxlab/formatters/control-formatter.js";
import { DropdownComponent, type DropdownChangeDetail } from "../dropdown-component.js";
import type {
    ColorFieldConfig,
    DropdownFieldConfig,
    FieldStores,
    SectionField,
    SectionShell,
    SliderFieldConfig,
    ToggleFieldConfig,
} from "./section-field-types.js";
export type {
    ColorFieldConfig,
    DropdownFieldConfig,
    FieldStores,
    SectionConfig,
    SectionField,
    SectionShell,
    SliderFieldConfig,
    ToggleFieldConfig,
} from "./section-field-types.js";

interface InstallCtx<TSettings, F, D> {
    field: F;
    defaultValue: D;
    section: SectionShell;
    emit: () => void;
    stores: FieldStores<TSettings>;
}

function installSliderField<TSettings>(
    ctx: InstallCtx<TSettings, SliderFieldConfig<TSettings, keyof TSettings>, number>,
): void {
    const { field, defaultValue, section, emit, stores } = ctx;
    const { wrapper, input } = createSliderInput({
        label: field.label,
        min: field.min,
        max: field.max,
        step: field.step,
        value: defaultValue,
        formatValue: field.formatValue,
    });
    input.addEventListener("input", () => {
        stores.settings[field.key as string] = Number.parseFloat(input.value);
        emit();
    });
    section.addChild(wrapper);
    stores.inputsByKey.set(field.key, input);
}

function installColorField<TSettings>(
    ctx: InstallCtx<TSettings, ColorFieldConfig<TSettings, keyof TSettings>, string>,
): void {
    const { field, defaultValue, section, emit, stores } = ctx;
    const { wrapper, input } = createColorInput({ label: field.label, value: defaultValue });
    input.addEventListener("input", () => {
        stores.settings[field.key as string] = input.value;
        emit();
    });
    section.addChild(wrapper);
    stores.inputsByKey.set(field.key, input);
}

function installToggleField<TSettings>(
    ctx: InstallCtx<TSettings, ToggleFieldConfig<TSettings, keyof TSettings>, boolean>,
): void {
    const { field, defaultValue, section, emit, stores } = ctx;
    const { wrapper, input } = createToggleInput({ label: field.label, checked: defaultValue });
    input.addEventListener("change", () => {
        stores.settings[field.key as string] = input.checked;
        emit();
    });
    section.addChild(wrapper);
    stores.inputsByKey.set(field.key, input);
}

function installDropdownField<TSettings>(
    ctx: InstallCtx<TSettings, DropdownFieldConfig<TSettings, keyof TSettings, string>, string>,
): void {
    const { field, defaultValue, section, stores, emit } = ctx;
    const dropdown = new DropdownComponent<string>(field.options, defaultValue, "voxlab__dropdown--banner");
    dropdown.mount(section.el);
    dropdown.addEventListener("change", (e) => {
        const detail = (e as CustomEvent<DropdownChangeDetail<string>>).detail;
        stores.settings[field.key as string] = detail.value;
        emit();
    });
    stores.dropdownsByKey.set(field.key, dropdown);
}

export function installField<TSettings>(ctx: InstallCtx<TSettings, SectionField<TSettings>, unknown>): void {
    const { field, defaultValue, section, emit, stores } = ctx;
    switch (field.type) {
        case "slider":
            installSliderField({ defaultValue: defaultValue as number, field, section, emit, stores });
            return;
        case "color":
            installColorField({ defaultValue: defaultValue as string, field, section, emit, stores });
            return;
        case "toggle":
            installToggleField({ defaultValue: defaultValue as boolean, field, section, emit, stores });
            return;
        case "dropdown":
            installDropdownField({ defaultValue: String(defaultValue), field, section, emit, stores });
            return;
    }
}
