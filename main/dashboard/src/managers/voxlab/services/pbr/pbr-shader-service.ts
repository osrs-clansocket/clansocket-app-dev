import { DataTexture, ShaderMaterial, WebGLRenderTarget, type WebGLRenderer } from "three";
import type { PbrMapSlot } from "../../../../shared/types/voxlab/paint/paint-types.js";
import {
    readbackTexture,
    setSlotUniforms,
    uploadSource,
    type PbrChannelConfig,
    type PbrChannelResult,
    type PbrGenResult,
} from "./shader-service-utils.js";
import { buildShaderMaterial, ensureSceneCamera, ensureTarget, type SceneRefs } from "./shader-service-resources.js";
export type { PbrChannelConfig, PbrChannelResult, PbrGenResult } from "./shader-service-utils.js";

export class PbrShaderService {
    private readonly renderer: WebGLRenderer;
    private readonly sceneRefs: SceneRefs = { scene: null, camera: null, quad: null, quadGeom: null };
    private sourceTexture: DataTexture | null = null;
    private readonly targets: Partial<Record<PbrMapSlot, WebGLRenderTarget>> = {};
    private readonly materials: Partial<Record<PbrMapSlot, ShaderMaterial>> = {};

    constructor(renderer: WebGLRenderer) {
        this.renderer = renderer;
    }

    private ensureMaterial(slot: PbrMapSlot): ShaderMaterial {
        const existing = this.materials[slot];
        if (existing !== undefined) return existing;
        const mat = buildShaderMaterial(slot);
        this.materials[slot] = mat;
        return mat;
    }

    private renderChannel(args: {
        slot: PbrMapSlot;
        source: DataTexture;
        width: number;
        height: number;
        config: PbrChannelConfig;
    }): PbrChannelResult {
        const { slot, source, width, height, config } = args;
        const { scene, camera, quad } = ensureSceneCamera(this.sceneRefs);
        const material = this.ensureMaterial(slot);
        const target = ensureTarget(this.targets, slot, width, height);
        material.uniforms.uSource.value = source;
        material.uniforms.uTexelSize.value.set(1 / width, 1 / height);
        setSlotUniforms(slot, material, config);
        quad.material = material;
        const prevTarget = this.renderer.getRenderTarget();
        this.renderer.setRenderTarget(target);
        this.renderer.render(scene, camera);
        this.renderer.setRenderTarget(prevTarget);
        const pixels = readbackTexture(this.renderer, target);
        return { texture: target.texture, pixels };
    }

    generate(source: ImageData, channels: PbrChannelConfig): PbrGenResult {
        const w = source.width;
        const h = source.height;
        this.sourceTexture = uploadSource(source, this.sourceTexture);
        const srcTex = this.sourceTexture;
        const result: PbrGenResult = {};
        const slots: PbrMapSlot[] = ["normal", "roughness", "metalness", "ao"];
        for (const slot of slots) {
            if (channels[slot] === undefined) continue;
            result[slot] = this.renderChannel({ slot, source: srcTex, width: w, height: h, config: channels });
        }
        return result;
    }

    dispose(): void {
        if (this.sourceTexture !== null) {
            this.sourceTexture.dispose();
            this.sourceTexture = null;
        }
        if (this.sceneRefs.quadGeom !== null) {
            this.sceneRefs.quadGeom.dispose();
            this.sceneRefs.quadGeom = null;
        }
        for (const slot of Object.keys(this.targets) as PbrMapSlot[]) {
            this.targets[slot]?.dispose();
            delete this.targets[slot];
        }
        for (const slot of Object.keys(this.materials) as PbrMapSlot[]) {
            this.materials[slot]?.dispose();
            delete this.materials[slot];
        }
        this.sceneRefs.scene = null;
        this.sceneRefs.camera = null;
        this.sceneRefs.quad = null;
    }
}
