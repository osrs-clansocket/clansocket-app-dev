import { pathColor, pathNumber, pathStep } from "../../../../state/voxlab/registries/snapshot-registry.js";
import type {
    ColorFieldConfig,
    SectionField,
    SliderFieldConfig,
    ToggleFieldConfig,
} from "../panels/section/section-component.js";

export interface SliderArgs<T> {
    key: keyof T & string;
    label: string;
    min: number;
    max: number;
    step: number;
    formatValue?: (n: number) => string;
}

export function sliderField<T>(args: SliderArgs<T>): SectionField<T> {
    const { key, label, min, max, step, formatValue } = args;
    const base: SliderFieldConfig<T, keyof T> = {
        label,
        min,
        max,
        step,
        type: "slider",
        key: key as keyof T,
        snapshotPath: pathNumber(key, key),
    };
    return (formatValue ? { ...base, formatValue } : base) as SectionField<T>;
}

export function colorField<T>(key: keyof T & string, label: string): SectionField<T> {
    const base: ColorFieldConfig<T, keyof T> = {
        label,
        type: "color",
        key: key as keyof T,
        snapshotPath: pathColor(key, key),
    };
    return base as SectionField<T>;
}

export function toggleField<T>(key: keyof T & string, label: string): SectionField<T> {
    const base: ToggleFieldConfig<T, keyof T> = {
        label,
        type: "toggle",
        key: key as keyof T,
        snapshotPath: pathStep(key, key),
    };
    return base as SectionField<T>;
}
