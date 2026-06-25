import { BaseVoxlabComponent } from "../../../../../managers/voxlab/base/base-voxlab-component.js";
import {
    createAmbientSection,
    createBackgroundSection,
    createBloomSection,
    bottomLight,
    chromaticAberration,
    coatSheen,
    colorSpace,
    createContrastSection,
    createEmissiveSection,
    createEnvironmentSection,
    fillLight,
    gridAxes,
    createHemisphereSection,
    keyLight,
    createOutlineSection,
    pixelRatio,
    createQualitySection,
    rimLight,
    createShadingSection,
    createShadowsSection,
    createStressSection,
    createSurfaceSection,
    toneExposure,
    topLight,
    createVignetteSection,
    createWireframeSection,
} from "../../sections/split-sections/split-sections.js";
import { CameraSectionComponent } from "../../sections/camera/camera-section-component.js";
import { MeshSectionComponent } from "../../sections/mesh/mesh-section-component.js";
import { MotionSectionComponent } from "../../sections/motion/motion-section-component.js";
import { TargetFpsComp } from "../../sections/fps-section.js";
import { AlbedoSection } from "../../texture/sections/albedo-section.js";
import { GradientSection } from "../../texture/sections/gradient-section.js";
import { PaintSection } from "../../texture/sections/paint-section.js";
import { PartsSection } from "../../texture/sections/parts-section.js";
import { PbrGenerationSection } from "../../texture/sections/pbr-generation-section.js";
import { PbrMapsSection } from "../../texture/sections/pbr-maps-section.js";

export abstract class FooterSectionsMixin extends BaseVoxlabComponent {
    readonly mesh = new MeshSectionComponent();
    readonly surface = createSurfaceSection();
    readonly emissive = createEmissiveSection();
    readonly coatSheen = coatSheen();
    readonly wireframe = createWireframeSection();
    readonly background = createBackgroundSection();
    readonly gridAxes = gridAxes();
    readonly camera = new CameraSectionComponent();
    readonly motion = new MotionSectionComponent();
    readonly quality = createQualitySection();
    readonly bloom = createBloomSection();
    readonly outline = createOutlineSection();
    readonly stress = createStressSection();
    readonly pixelRatio = pixelRatio();
    readonly vignette = createVignetteSection();
    readonly contrast = createContrastSection();
    readonly chromaticAberration = chromaticAberration();
    readonly colorSpace = colorSpace();
    readonly targetFps = new TargetFpsComp();
    readonly environment = createEnvironmentSection();
    readonly toneExposure = toneExposure();
    readonly shading = createShadingSection();
    readonly shadows = createShadowsSection();
    readonly hemisphere = createHemisphereSection();
    readonly ambient = createAmbientSection();
    readonly keyLight = keyLight();
    readonly fillLight = fillLight();
    readonly rimLight = rimLight();
    readonly topLight = topLight();
    readonly bottomLight = bottomLight();
    readonly parts = new PartsSection();
    readonly paint = new PaintSection();
    readonly gradient = new GradientSection();
    readonly albedo = new AlbedoSection();
    readonly pbrMaps = new PbrMapsSection();
    readonly pbrGeneration = new PbrGenerationSection();
}
