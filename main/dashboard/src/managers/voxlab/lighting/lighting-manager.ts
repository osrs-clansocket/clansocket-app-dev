import {
    Color,
    type AmbientLight,
    type DirectionalLight,
    type HemisphereLight,
    type PMREMGenerator,
    type Scene,
    type Texture,
    type WebGLRenderer,
} from "three";
import { WeakRefCache } from "../../../state/caches/weak-ref-cache.js";
import { applyBottom, applyHemisphere, applyRim, applyTop } from "./lighting-manager-apply.js";
import { addLightsScene, buildLights, buildPmrem } from "./lighting-manager-init.js";
import { clearHdrFrom, loadHdrInto, refreshSceneEnvironment, type EnvDeps } from "./lighting-manager-env.js";
import { disposeLighting } from "./lighting-manager-dispose.js";
import type { PmremKit } from "./lighting-pmrem.js";
import {
    DEFAULT_BOTTOM_LIGHT,
    DEFAULT_ENVIRONMENT,
    DEFAULT_HEMISPHERE,
    DEFAULT_LIGHTING,
    DEFAULT_RIM_LIGHT,
    DEFAULT_TOP_LIGHT,
} from "../../../shared/constants/voxlab/lighting/light-constants.js";
import type {
    BottomLightSettings,
    EnvironmentSettings,
    HemisphereSettings,
    LightSettings,
    RimLightSettings,
    TopLightSettings,
} from "../../../shared/types/voxlab/light-types.js";

const pmremKitCache = new WeakRefCache<WebGLRenderer, PmremKit>({ tag: "voxlab" });

export class LightingManager {
    private ambient!: AmbientLight;
    private key!: DirectionalLight;
    private fill!: DirectionalLight;
    private rim!: DirectionalLight;
    private top!: DirectionalLight;
    private bottom!: DirectionalLight;
    private hemi!: HemisphereLight;
    private readonly hemiSky = new Color();
    private readonly hemiGround = new Color();
    private readonly fillColor = new Color();
    private readonly rimColor = new Color();
    private readonly topColor = new Color();
    private readonly bottomColor = new Color();
    private readonly pmrem: PMREMGenerator;
    private readonly proceduralEnv: Texture;
    private readonly refs = {
        uploadedEnv: { v: null as Texture | null },
        uploadedHdrName: { v: null as string | null },
        hdrLoadEpoch: { v: 0 },
        environmentEnabled: { v: DEFAULT_ENVIRONMENT.enabled },
        environmentIntensity: { v: DEFAULT_ENVIRONMENT.intensity },
    };

    private applyAllDefaults(): void {
        this.applySettings(DEFAULT_LIGHTING);
        this.applyHemisphere(DEFAULT_HEMISPHERE);
        this.applyRim(DEFAULT_RIM_LIGHT);
        this.applyTop(DEFAULT_TOP_LIGHT);
        this.applyBottom(DEFAULT_BOTTOM_LIGHT);
        this.applyEnvironment(DEFAULT_ENVIRONMENT);
    }

    constructor(
        private readonly scene: Scene,
        renderer: WebGLRenderer,
    ) {
        const lights = buildLights({
            fill: this.fillColor,
            rim: this.rimColor,
            top: this.topColor,
            bottom: this.bottomColor,
        });
        this.ambient = lights.ambient;
        this.key = lights.key;
        this.fill = lights.fill;
        this.rim = lights.rim;
        this.top = lights.top;
        this.bottom = lights.bottom;
        this.hemi = lights.hemi;
        addLightsScene(scene, lights);
        const pmremKit = buildPmrem(renderer, pmremKitCache);
        this.pmrem = pmremKit.pmrem;
        this.proceduralEnv = pmremKit.proceduralEnv;
        this.applyAllDefaults();
    }

    setShadowsEnabled(enabled: boolean): void {
        if (!enabled && this.key.shadow.map !== null) {
            this.key.shadow.map.dispose();
            this.key.shadow.map = null;
        }
        this.key.castShadow = enabled;
    }

    applySettings(settings: LightSettings): void {
        this.ambient.intensity = settings.ambientIntensity;
        this.key.intensity = settings.keyIntensity;
        this.key.position.set(settings.keyPositionX, settings.keyPositionY, settings.keyPositionZ);
        this.key.shadow.bias = settings.shadowBias;
        this.key.shadow.radius = settings.shadowRadius;
        this.fill.intensity = settings.fillIntensity;
        this.fillColor.set(settings.fillColor);
        this.fill.color = this.fillColor;
        this.fill.position.set(settings.fillPositionX, settings.fillPositionY, settings.fillPositionZ);
    }

    applyHemisphere(s: HemisphereSettings): void {
        applyHemisphere(this.hemi, this.hemiSky, this.hemiGround, s);
    }
    applyRim(s: RimLightSettings): void {
        applyRim(this.rim, this.rimColor, s);
    }
    applyTop(s: TopLightSettings): void {
        applyTop(this.top, this.topColor, s);
    }
    applyBottom(s: BottomLightSettings): void {
        applyBottom(this.bottom, this.bottomColor, s);
    }
    applyEnvironment(s: EnvironmentSettings): void {
        this.refs.environmentEnabled.v = s.enabled;
        this.refs.environmentIntensity.v = s.intensity;
        this.refs.uploadedHdrName.v = s.hdrName;
        refreshSceneEnvironment(this.envDeps);
    }
    async loadHdr(buffer: ArrayBuffer, name: string): Promise<void> {
        await loadHdrInto(this.envDeps, buffer, name);
    }
    clearHdr(): void {
        clearHdrFrom(this.envDeps);
    }
    get hdrName(): string | null {
        return this.refs.uploadedHdrName.v;
    }

    dispose(): void {
        const { scene, refs, ambient, key, fill, rim, top, bottom, hemi } = this;
        disposeLighting({ scene, refs, ambient, key, fill, rim, top, bottom, hemi });
    }

    private get envDeps(): EnvDeps {
        return { scene: this.scene, pmrem: this.pmrem, proceduralEnv: this.proceduralEnv, refs: this.refs };
    }
}
