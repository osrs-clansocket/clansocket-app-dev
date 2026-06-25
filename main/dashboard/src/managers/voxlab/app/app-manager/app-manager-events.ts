import type { FooterPanelComponent } from "../../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type { TexturePaintManager } from "../../paint/texture-paint-manager.js";

type EvEntry = [EventTarget, string];

const FOOTER_EVENT_MAP: ReadonlyArray<[keyof FooterPanelComponent, string]> = [
    ["surface", "surface-change"],
    ["emissive", "emissive-change"],
    ["coatSheen", "coat-sheen-change"],
    ["wireframe", "wireframe-change"],
    ["shading", "shading-change"],
    ["shadows", "shadows-change"],
    ["ambient", "ambient-change"],
    ["keyLight", "key-light-change"],
    ["fillLight", "fill-light-change"],
    ["environment", "environment-change"],
    ["hemisphere", "hemisphere-change"],
    ["rimLight", "rim-light-change"],
    ["topLight", "top-light-change"],
    ["bottomLight", "bottom-light-change"],
    ["background", "background-change"],
    ["toneExposure", "tone-exposure-change"],
    ["gridAxes", "grid-axes-change"],
    ["camera", "camera-change"],
    ["motion", "motion-change"],
    ["quality", "quality-change"],
    ["bloom", "bloom-change"],
    ["outline", "outline-change"],
    ["vignette", "vignette-change"],
    ["contrast", "contrast-change"],
    ["chromaticAberration", "chromatic-aberration-change"],
    ["pixelRatio", "pixel-ratio-change"],
    ["targetFps", "target-fps-change"],
    ["colorSpace", "color-space-change"],
    ["stress", "stress-change"],
    ["mesh", "mesh-change"],
    ["parts", "parts-section-change"],
    ["parts", "parts-fill"],
    ["parts", "parts-reset"],
    ["paint", "brush-change"],
    ["paint", "paint-clear-all"],
    ["gradient", "gradient-change"],
    ["gradient", "gradient-apply"],
    ["albedo", "albedo-change"],
    ["pbrMaps", "pbr-maps-change"],
    ["pbrGeneration", "pbr-generation-change"],
    ["pbrGeneration", "pbr-generate"],
];

export function recorderEvents(footer: FooterPanelComponent, texturePaint: TexturePaintManager): EvEntry[] {
    const entries: EvEntry[] = FOOTER_EVENT_MAP.map(([key, event]) => [footer[key] as EventTarget, event]);
    entries.push([texturePaint, "paint-state-change"]);
    return entries;
}
