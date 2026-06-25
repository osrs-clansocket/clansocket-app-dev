import type { MeshSettings } from "../../../../../shared/types/voxlab/mesh/mesh-settings-types.js";
import type { MeshInputRefs } from "./mesh-section-wiring.js";

export function wireToggleInputs(
    inputs: MeshInputRefs,
    settings: MeshSettings,
    emit: () => void,
    emitBake: () => void,
): void {
    inputs.normalize.addEventListener("change", () => {
        settings.normalize = inputs.normalize.checked;
        emit();
        emitBake();
    });
    inputs.vertexColor.addEventListener("input", () => {
        settings.vertexColor = inputs.vertexColor.value;
        emit();
        emitBake();
    });
}
