import type { MeshSettings } from "../../../../shared/types/voxlab/mesh/mesh-settings-types.js";
import type { MeshInputRefs } from "./section-input-refs.js";
import type { FieldConfig } from "./field-config-types.js";

export type { FieldConfig } from "./field-config-types.js";

function bakedChange(input: HTMLInputElement, apply: (v: number) => void): FieldConfig {
    return { input, apply, eventType: "change", baked: true };
}

export function numericFieldConfigs(inputs: MeshInputRefs, settings: MeshSettings): FieldConfig[] {
    return [
        bakedChange(inputs.smoothingRounds, (v) => {
            settings.smoothingRounds = Math.round(v);
        }),
        bakedChange(inputs.cornerAngle, (v) => {
            settings.cornerAngleDegrees = v;
        }),
        {
            input: inputs.scale,
            eventType: "input",
            apply: (v) => {
                settings.scale = v;
            },
            baked: false,
        },
        bakedChange(inputs.taubinLambda, (v) => {
            settings.taubinLambda = v;
        }),
        bakedChange(inputs.taubinMu, (v) => {
            settings.taubinMu = v;
        }),
    ];
}
