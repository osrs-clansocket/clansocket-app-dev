import { Color, WebGLRenderTarget, type Camera, type Object3D, type Scene, type WebGLRenderer } from "three";
import type { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { DEFAULT_EFFECTS } from "../../../shared/constants/voxlab/effect-constants.js";
import type { EffectsSettings } from "../../../shared/types/voxlab/effects-types.js";
import {
    clampSamples,
    clampSupersample,
    enabledSet,
    PASS_KEYS,
    passSetsEqual,
    PIXEL_RATIO_EPSILON,
    TONE_MAPPING_MAP,
    type OffscreenPasses,
    type OnscreenPasses,
    type PassEnabledSet,
} from "./effects-manager-types.js";
import type { BuildDeps } from "./effects-manager-build.js";
import { buildOffscreen, buildOnscreen, resizeFxaa, syncPasses } from "./effects-manager-sync.js";

let selectedOutlineObjects: Object3D[] = [];

export class EffectsManager {
    private onscreen!: OnscreenPasses;
    private offscreen: OffscreenPasses | null = null;
    private offscreenPassSet: PassEnabledSet | null = null;
    private readonly bgColor = new Color();
    private cachedSettings: EffectsSettings = { ...DEFAULT_EFFECTS };
    private currentWidth: number;
    private currentHeight: number;
    private cachedSamples = -1;
    private currentPassSet: PassEnabledSet = enabledSet(DEFAULT_EFFECTS);
    private readonly deps: BuildDeps;

    constructor(
        renderer: WebGLRenderer,
        private readonly scene: Scene,
        camera: Camera,
        initialSize: { width: number; height: number },
    ) {
        this.deps = { renderer, scene, camera };
        this.currentWidth = initialSize.width;
        this.currentHeight = initialSize.height;
        this.rebuildOnscreen(clampSamples(DEFAULT_EFFECTS.msaaSamples));
        this.applySettings(DEFAULT_EFFECTS);
    }

    get composer(): EffectComposer {
        return this.onscreen.composer;
    }

    render(): void {
        if (this.isBypassable()) this.deps.renderer.render(this.deps.scene, this.deps.camera);
        else this.onscreen.composer.render();
    }

    private isBypassable(): boolean {
        const p = this.onscreen;
        for (const k of PASS_KEYS) if (p[k] !== undefined) return false;
        return true;
    }

    resize(width: number, height: number): void {
        this.currentWidth = width;
        this.currentHeight = height;
        this.onscreen.composer.setSize(width, height);
        resizeFxaa(this.onscreen, width, height, this.deps.renderer.getPixelRatio());
    }

    setSelectedObjects(objects: Object3D[]): void {
        selectedOutlineObjects = objects;
        if (this.onscreen.outline) this.onscreen.outline.selectedObjects = objects;
    }

    getSupersample(): number {
        return clampSupersample(this.cachedSettings.supersample);
    }

    applySettings(settings: EffectsSettings): void {
        const samples = clampSamples(settings.msaaSamples);
        this.cachedSettings = settings;
        const targetPixelRatio = window.devicePixelRatio * clampSupersample(settings.supersample);
        if (Math.abs(this.deps.renderer.getPixelRatio() - targetPixelRatio) > PIXEL_RATIO_EPSILON) {
            this.deps.renderer.setPixelRatio(targetPixelRatio);
            this.onscreen.composer.setPixelRatio(targetPixelRatio);
            this.resize(this.currentWidth, this.currentHeight);
        }
        const nextSet = enabledSet(settings);
        if (samples !== this.cachedSamples || !passSetsEqual(nextSet, this.currentPassSet))
            this.rebuildOnscreen(samples);
        this.deps.renderer.toneMapping = TONE_MAPPING_MAP[settings.toneMapping];
        this.deps.renderer.toneMappingExposure = settings.exposure;
        this.bgColor.set(settings.backgroundColor);
        this.scene.background = this.bgColor;
        syncPasses(this.onscreen, settings);
        if (this.offscreen) syncPasses(this.offscreen, settings);
    }

    renderOffscreen(width: number, height: number): WebGLRenderTarget {
        const passes = this.ensureOffscreen();
        passes.composer.setSize(width, height);
        if (passes.fxaa) passes.fxaa.material.uniforms.resolution.value.set(1 / width, 1 / height);
        passes.composer.render();
        return passes.composer.readBuffer;
    }

    dispose(): void {
        this.onscreen.composer.dispose();
        if (this.offscreen) {
            this.offscreen.composer.dispose();
            this.offscreen = null;
        }
    }

    private rebuildOnscreen(samples: number): void {
        if (this.onscreen) this.onscreen.composer.dispose();
        this.onscreen = buildOnscreen({
            samples,
            deps: this.deps,
            settings: this.cachedSettings,
            width: this.currentWidth,
            height: this.currentHeight,
            selectedObjects: selectedOutlineObjects,
        });
        this.cachedSamples = samples;
        this.currentPassSet = enabledSet(this.cachedSettings);
    }

    private ensureOffscreen(): OffscreenPasses {
        const wantSet = enabledSet(this.cachedSettings);
        if (this.offscreen && this.offscreenPassSet && passSetsEqual(this.offscreenPassSet, wantSet))
            return this.offscreen;
        if (this.offscreen) {
            this.offscreen.composer.dispose();
            this.offscreen = null;
        }
        this.offscreen = buildOffscreen(
            this.deps,
            this.cachedSettings,
            clampSamples(this.cachedSettings.msaaSamples),
            selectedOutlineObjects,
        );
        this.offscreenPassSet = wantSet;
        return this.offscreen;
    }
}
