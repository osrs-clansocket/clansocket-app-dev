import type { BaseVoxlabComponent } from "../../../../../managers/voxlab/base/base-voxlab-component.js";
import { panelDefs } from "../../../../../state/voxlab/registries/layout-panel-registry.js";
import type { FooterPanelSections } from "./footer-panel-types.js";

export type SectionGroup =
    | "core"
    | "fx"
    | "lights"
    | "textures"
    | "all"
    | "lightSections"
    | "meshSections"
    | "colorSections"
    | "textureSections"
    | "sceneSections"
    | "cameraSections"
    | "displaySections";

const SECTION_GROUPS: Record<SectionGroup, (s: FooterPanelSections) => ReadonlyArray<BaseVoxlabComponent>> = {
    core: (s) => [
        s.mesh,
        s.surface,
        s.emissive,
        s.coatSheen,
        s.wireframe,
        s.background,
        s.gridAxes,
        s.camera,
        s.motion,
    ],
    fx: (s) => [
        s.quality,
        s.bloom,
        s.outline,
        s.stress,
        s.pixelRatio,
        s.vignette,
        s.contrast,
        s.chromaticAberration,
        s.colorSpace,
        s.targetFps,
        s.environment,
        s.toneExposure,
        s.shading,
        s.shadows,
    ],
    lights: (s) => [s.hemisphere, s.ambient, s.keyLight, s.fillLight, s.rimLight, s.topLight, s.bottomLight],
    textures: (s) => [s.parts, s.paint, s.gradient, s.albedo, s.pbrMaps, s.pbrGeneration],
    all: (s) => [
        ...sectionsOf(s, "core"),
        ...sectionsOf(s, "fx"),
        ...sectionsOf(s, "lights"),
        ...sectionsOf(s, "textures"),
    ],
    lightSections: (s) => [
        s.environment,
        s.shading,
        s.shadows,
        s.hemisphere,
        s.ambient,
        s.keyLight,
        s.fillLight,
        s.rimLight,
        s.topLight,
        s.bottomLight,
        s.emissive,
        s.bloom,
    ],
    meshSections: (s) => [s.mesh, s.wireframe],
    colorSections: (s) => [s.surface, s.coatSheen, s.parts, s.paint, s.gradient],
    textureSections: (s) => [s.albedo, s.pbrMaps, s.pbrGeneration],
    sceneSections: (s) => [s.background, s.gridAxes],
    cameraSections: (s) => [s.camera],
    displaySections: (s) => [
        s.pixelRatio,
        s.toneExposure,
        s.quality,
        s.vignette,
        s.contrast,
        s.colorSpace,
        s.targetFps,
    ],
};

export function sectionsOf(s: FooterPanelSections, group: SectionGroup): ReadonlyArray<BaseVoxlabComponent> {
    return SECTION_GROUPS[group](s);
}

export function orderedSectionsOf(
    s: FooterPanelSections,
): ReadonlyArray<{ id: string; title: string; component: BaseVoxlabComponent }> {
    return panelDefs().map((def) => ({
        id: def.id,
        title: def.title,
        component: def.accessor(s as unknown as Record<string, BaseVoxlabComponent>),
    }));
}
