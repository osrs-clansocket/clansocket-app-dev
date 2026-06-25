import type { ShaderMaterial } from "three";
import type { PbrMapSlot } from "../../../../shared/types/voxlab/paint/paint-types.js";
import type { PbrChannelConfig } from "./pbr-shader-types.js";

export function setSlotUniforms(slot: PbrMapSlot, material: ShaderMaterial, config: PbrChannelConfig): void {
    switch (slot) {
        case "normal":
            if (config.normal !== undefined) material.uniforms.uStrength.value = config.normal.sobelStrength;
            return;
        case "roughness":
            if (config.roughness !== undefined) material.uniforms.uInvert.value = config.roughness.invert ? 1 : 0;
            return;
        case "metalness":
            if (config.metalness !== undefined) material.uniforms.uThreshold.value = config.metalness.threshold;
            return;
        case "ao":
            if (config.ao !== undefined) material.uniforms.uRadius.value = Math.max(1, Math.floor(config.ao.radius));
            return;
    }
}
