import type { FooterPanelComponent } from "../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type {
    AmbientFields,
    FillLightFields,
    KeyLightFields,
} from "../../../dom/forms/voxlab/sections/split-sections/split-sections.js";
import type {
    BottomLightSettings,
    EnvironmentSettings,
    HemisphereSettings,
    LightSettings,
    RimLightSettings,
    TopLightSettings,
} from "../../../shared/types/voxlab/light-types.js";
import type { LightingManager } from "./lighting-manager.js";

export interface LightWiringDeps {
    footer: FooterPanelComponent;
    lighting: LightingManager;
    lightAggregate: LightSettings;
}

function wireAggregateLights(deps: LightWiringDeps): void {
    const { footer, lighting, lightAggregate } = deps;
    const applyLights = (): void => lighting.applySettings(lightAggregate);
    footer.ambient.addEventListener("ambient-change", (e) => {
        Object.assign(lightAggregate, (e as CustomEvent<AmbientFields>).detail);
        applyLights();
    });
    footer.keyLight.addEventListener("key-light-change", (e) => {
        Object.assign(lightAggregate, (e as CustomEvent<KeyLightFields>).detail);
        applyLights();
    });
    footer.fillLight.addEventListener("fill-light-change", (e) => {
        Object.assign(lightAggregate, (e as CustomEvent<FillLightFields>).detail);
        applyLights();
    });
}

function wireIndependentLights({ footer, lighting }: LightWiringDeps): void {
    footer.environment.addEventListener("environment-change", (e) =>
        lighting.applyEnvironment((e as CustomEvent<EnvironmentSettings>).detail),
    );
    footer.hemisphere.addEventListener("hemisphere-change", (e) =>
        lighting.applyHemisphere((e as CustomEvent<HemisphereSettings>).detail),
    );
    footer.rimLight.addEventListener("rim-light-change", (e) =>
        lighting.applyRim((e as CustomEvent<RimLightSettings>).detail),
    );
    footer.topLight.addEventListener("top-light-change", (e) =>
        lighting.applyTop((e as CustomEvent<TopLightSettings>).detail),
    );
    footer.bottomLight.addEventListener("bottom-light-change", (e) =>
        lighting.applyBottom((e as CustomEvent<BottomLightSettings>).detail),
    );
}

export function wireLightEvents(deps: LightWiringDeps): void {
    wireAggregateLights(deps);
    wireIndependentLights(deps);
}
