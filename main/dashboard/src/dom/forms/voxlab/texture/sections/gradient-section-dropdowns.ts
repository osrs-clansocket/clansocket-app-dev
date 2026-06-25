import type {
    GradientAxis,
    GradientSpec,
    GradientTarget,
    GradientType,
} from "../../../../../shared/types/voxlab/paint/paint-types.js";
import { DropdownComponent, type DropdownChangeDetail } from "../../panels/dropdown-component.js";

export interface GradientDropdownSet {
    typeDropdown: DropdownComponent<GradientType>;
    axisDropdown: DropdownComponent<GradientAxis>;
    targetDropdown: DropdownComponent<GradientTarget>;
}

function wireDropdown<T extends string>(
    dropdown: DropdownComponent<T>,
    apply: (v: T) => void,
    onChange: () => void,
): DropdownComponent<T> {
    dropdown.addEventListener("change", (e) => {
        apply((e as CustomEvent<DropdownChangeDetail<T>>).detail.value);
        onChange();
    });
    return dropdown;
}

function buildTypeDropdown(settings: GradientSpec, onChange: () => void): DropdownComponent<GradientType> {
    return wireDropdown(
        new DropdownComponent<GradientType>(
            [
                { value: "linear", label: "Linear" },
                { value: "radial", label: "Radial" },
            ],
            settings.type,
        ),
        (v) => {
            settings.type = v;
        },
        onChange,
    );
}

function buildAxisDropdown(settings: GradientSpec, onChange: () => void): DropdownComponent<GradientAxis> {
    return wireDropdown(
        new DropdownComponent<GradientAxis>(
            [
                { value: "x", label: "X axis (linear)" },
                { value: "y", label: "Y axis (linear)" },
                { value: "z", label: "Z axis (linear)" },
            ],
            settings.axis,
        ),
        (v) => {
            settings.axis = v;
        },
        onChange,
    );
}

function buildTargetDropdown(settings: GradientSpec, onChange: () => void): DropdownComponent<GradientTarget> {
    return wireDropdown(
        new DropdownComponent<GradientTarget>(
            [
                { value: "all", label: "Target: All" },
                { value: "front", label: "Target: Front" },
                { value: "back", label: "Target: Back" },
                { value: "sides", label: "Target: Sides" },
            ],
            settings.target,
        ),
        (v) => {
            settings.target = v;
        },
        onChange,
    );
}

export function buildGradientDropdowns(settings: GradientSpec, onChange: () => void): GradientDropdownSet {
    return {
        typeDropdown: buildTypeDropdown(settings, onChange),
        axisDropdown: buildAxisDropdown(settings, onChange),
        targetDropdown: buildTargetDropdown(settings, onChange),
    };
}
