import type { FooterPanelComponent } from "../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type {
    CoatSheenFields,
    EmissiveFields,
    SurfaceFields,
} from "../../../dom/forms/voxlab/sections/split-sections/split-sections.js";
import type { MaterialSettings } from "../../../shared/types/voxlab/material-types.js";
import type { MeshManager } from "../mesh/mesh-manager.js";

export interface MaterialWiringDeps {
    footer: FooterPanelComponent;
    meshes: MeshManager;
    materialAggregate: MaterialSettings;
}

export function wireMaterialEvents(deps: MaterialWiringDeps): void {
    const { footer, meshes, materialAggregate } = deps;
    const applyMat = (): void => meshes.applyMaterialSettings(materialAggregate);
    footer.surface.addEventListener("surface-change", (e) => {
        Object.assign(materialAggregate, (e as CustomEvent<SurfaceFields>).detail);
        applyMat();
    });
    footer.shading.addEventListener("shading-change", (e) => {
        const detail = (e as CustomEvent<{ smoothShading: boolean; flatShading: boolean }>).detail;
        materialAggregate.flatShading = detail.flatShading;
        applyMat();
    });
    footer.emissive.addEventListener("emissive-change", (e) => {
        Object.assign(materialAggregate, (e as CustomEvent<EmissiveFields>).detail);
        applyMat();
    });
    footer.coatSheen.addEventListener("coat-sheen-change", (e) => {
        Object.assign(materialAggregate, (e as CustomEvent<CoatSheenFields>).detail);
        applyMat();
    });
}
