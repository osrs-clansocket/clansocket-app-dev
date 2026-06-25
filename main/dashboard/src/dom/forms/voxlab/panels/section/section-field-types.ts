import type { DropdownComponent } from "../dropdown-component.js";
import type { PathSpec } from "../../../../../state/voxlab/registries/snapshot-registry.js";

export interface SliderFieldConfig<TSettings, K extends keyof TSettings> {
    type: "slider";
    key: K;
    label: string;
    min: number;
    max: number;
    step: number;
    formatValue?: (n: number) => string;
    snapshotPath?: PathSpec;
}

export interface ColorFieldConfig<TSettings, K extends keyof TSettings> {
    type: "color";
    key: K;
    label: string;
    snapshotPath?: PathSpec;
}

export interface ToggleFieldConfig<TSettings, K extends keyof TSettings> {
    type: "toggle";
    key: K;
    label: string;
    snapshotPath?: PathSpec;
}

export interface DropdownFieldConfig<TSettings, K extends keyof TSettings, V extends string> {
    type: "dropdown";
    key: K;
    options: ReadonlyArray<{ value: V; label: string }>;
    snapshotPath?: PathSpec;
}

export type SectionField<TSettings> =
    | SliderFieldConfig<TSettings, keyof TSettings>
    | ColorFieldConfig<TSettings, keyof TSettings>
    | ToggleFieldConfig<TSettings, keyof TSettings>
    | DropdownFieldConfig<TSettings, keyof TSettings, string>;

export interface SectionConfig<TSettings extends object> {
    snapshotName: string;
    title: string;
    eventName: string;
    defaults: TSettings;
    fields: ReadonlyArray<SectionField<TSettings>>;
}

export interface FieldStores<TSettings> {
    settings: Record<string, unknown>;
    inputsByKey: Map<keyof TSettings, HTMLInputElement>;
    dropdownsByKey: Map<keyof TSettings, DropdownComponent<string>>;
}

export interface SectionShell {
    addChild: (el: HTMLElement) => void;
    el: HTMLElement;
}
