import type { FooterPanelComponent } from "../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type {
    BackgroundFields,
    BloomFields,
    ChromaticAberrationFields,
    ColorSpaceFields,
    ContrastFields,
    GridAxesFields,
    OutlineFields,
    PixelRatioFields,
    QualityFields,
    TargetFpsFields,
    ToneExposureFields,
    VignetteFields,
} from "../../../dom/forms/voxlab/sections/split-sections/split-sections.js";
import type { CameraSettings } from "../../../shared/types/voxlab/camera-types.js";
import type { EffectsSettings } from "../../../shared/types/voxlab/effects-types.js";
import type { MeshSettings } from "../../../shared/types/voxlab/mesh/mesh-settings-types.js";
import type { MotionSettings } from "../../../shared/types/voxlab/motion-types.js";
import type { StressSettings } from "../../../shared/types/voxlab/stress-types.js";
import type { EffectsManager } from "../effects/effects-manager.js";
import type { MotionManager } from "../timeline/motion-manager.js";
import type { StressShaderManager } from "../effects/stress-shader-manager.js";
import type { ViewportManager } from "../viewport/viewport-manager.js";

interface EffectWiringDeps {
    footer: FooterPanelComponent;
    effects: EffectsManager;
    effectsAggregate: EffectsSettings;
}

export function wireGridAxes(deps: EffectWiringDeps & { viewport: ViewportManager }): void {
    const { footer, effects, effectsAggregate, viewport } = deps;
    footer.gridAxes.addEventListener("grid-axes-change", (e) => {
        const s = (e as CustomEvent<GridAxesFields>).detail;
        effectsAggregate.gridColor = s.gridColor;
        effectsAggregate.gridSize = s.gridSize;
        effectsAggregate.gridDivisions = s.gridDivisions;
        effectsAggregate.gridFloorY = s.gridFloorY;
        effectsAggregate.axesLength = s.axesLength;
        viewport.setGridColor(s.gridColor);
        viewport.setGridSize(s.gridSize);
        viewport.setGridDivisions(s.gridDivisions);
        viewport.setFloorY(s.gridFloorY);
        viewport.setAxesLength(s.axesLength);
        viewport.setAidsVisible(s.gridEnabled);
        effects.applySettings(effectsAggregate);
    });
}

export function wireEffectEvents(deps: EffectWiringDeps): void {
    const { footer, effects, effectsAggregate } = deps;
    const applyFx = (): void => effects.applySettings(effectsAggregate);
    const assign = <T>(eventName: string, target: EventTarget): void => {
        target.addEventListener(eventName, (e) => {
            Object.assign(effectsAggregate, (e as CustomEvent<T>).detail);
            applyFx();
        });
    };
    assign<BackgroundFields>("background-change", footer.background);
    assign<ToneExposureFields>("tone-exposure-change", footer.toneExposure);
    assign<QualityFields>("quality-change", footer.quality);
    assign<BloomFields>("bloom-change", footer.bloom);
    assign<OutlineFields>("outline-change", footer.outline);
    assign<VignetteFields>("vignette-change", footer.vignette);
    assign<ContrastFields>("contrast-change", footer.contrast);
    assign<ChromaticAberrationFields>("chromatic-aberration-change", footer.chromaticAberration);
}

export interface ViewportWiringDeps {
    footer: FooterPanelComponent;
    viewport: ViewportManager;
    motion: MotionManager;
    stress: StressShaderManager;
    applyCameraSettings: (s: CameraSettings) => void;
    applyMeshSettings: (s: MeshSettings) => void;
}

export function wireViewportEvents(deps: ViewportWiringDeps): void {
    const { footer, viewport, motion, stress, applyCameraSettings, applyMeshSettings } = deps;
    footer.camera.addEventListener("camera-change", (e) =>
        applyCameraSettings((e as CustomEvent<CameraSettings>).detail),
    );
    footer.motion.addEventListener("motion-change", (e) =>
        motion.updateSettings((e as CustomEvent<MotionSettings>).detail),
    );
    footer.pixelRatio.addEventListener("pixel-ratio-change", (e) =>
        viewport.setPixelRatio((e as CustomEvent<PixelRatioFields>).detail.pixelRatio),
    );
    footer.targetFps.addEventListener("target-fps-change", (e) =>
        viewport.setTargetFps((e as CustomEvent<TargetFpsFields>).detail.targetFps),
    );
    footer.colorSpace.addEventListener("color-space-change", (e) =>
        viewport.setColorSpace((e as CustomEvent<ColorSpaceFields>).detail.colorSpace),
    );
    footer.stress.addEventListener("stress-change", (e) =>
        stress.updateSettings((e as CustomEvent<StressSettings>).detail),
    );
    footer.mesh.addEventListener("mesh-change", (e) => applyMeshSettings((e as CustomEvent<MeshSettings>).detail));
}
