import type { MeshSettings } from "../../../../shared/types/voxlab/mesh/mesh-settings-types.js";
import type { MeshInputRefs } from "./section-input-refs.js";
import { numericFieldConfigs } from "./section-field-config.js";

function wireBakingNumeric(args: {
    input: HTMLInputElement;
    eventType: "change" | "input";
    apply: (val: number) => void;
    emit: () => void;
    emitBake?: () => void;
}): void {
    const { input, eventType, apply, emit, emitBake } = args;
    input.addEventListener(eventType, () => {
        apply(Number.parseFloat(input.value));
        emit();
        emitBake?.();
    });
}

export function wireNumericInputs(
    inputs: MeshInputRefs,
    settings: MeshSettings,
    emit: () => void,
    emitBake: () => void,
): void {
    for (const { input, eventType, apply, baked } of numericFieldConfigs(inputs, settings)) {
        wireBakingNumeric({ input, eventType, apply, emit, emitBake: baked ? emitBake : undefined });
    }
}
