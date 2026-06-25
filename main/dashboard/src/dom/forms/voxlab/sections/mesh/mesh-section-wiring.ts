import type { MeshSettings } from "../../../../../shared/types/voxlab/mesh/mesh-settings-types.js";
import { wireToggleInputs } from "./mesh-section-toggle.js";
import type { MeshInputRefs } from "../section-input-refs.js";
import { wireNumericInputs } from "../section-wire-numeric.js";

export type { MeshInputRefs } from "../section-input-refs.js";

export function wireMeshInputs(
    inputs: MeshInputRefs,
    settings: MeshSettings,
    emit: () => void,
    emitBake: () => void,
): void {
    wireNumericInputs(inputs, settings, emit, emitBake);
    wireToggleInputs(inputs, settings, emit, emitBake);
}
