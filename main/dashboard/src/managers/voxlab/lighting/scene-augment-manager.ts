import { MeshStandardMaterial, type Material, type Mesh } from "three";
import type { FooterPanelComponent } from "../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import {
    DEFAULT_BOTTOM_LIGHT,
    DEFAULT_ENVIRONMENT,
    DEFAULT_HEMISPHERE,
    DEFAULT_RIM_LIGHT,
    DEFAULT_TOP_LIGHT,
} from "../../../shared/constants/voxlab/lighting/light-constants.js";
import type { CursorService } from "../services/cursor-service.js";
import { DEFAULT_CAMERA } from "../../../shared/constants/voxlab/camera-constants.js";
import { DEFAULT_EFFECTS } from "../../../shared/constants/voxlab/effect-constants.js";
import { DEFAULT_LIGHTING } from "../../../shared/constants/voxlab/lighting/light-constants.js";
import { DEFAULT_MATERIAL_SETTINGS } from "../../../shared/constants/voxlab/material-constants.js";
import { DEFAULT_MESH_SETTINGS } from "../../../shared/constants/voxlab/mesh-settings-constants.js";
import { DEFAULT_MOTION } from "../../../shared/constants/voxlab/motion-constants.js";
import type { CameraSettings } from "../../../shared/types/voxlab/camera-types.js";
import type { EffectsSettings } from "../../../shared/types/voxlab/effects-types.js";
import type { LightSettings } from "../../../shared/types/voxlab/light-types.js";
import type { MaterialSettings } from "../../../shared/types/voxlab/material-types.js";
import type { MeshSettings } from "../../../shared/types/voxlab/mesh/mesh-settings-types.js";
import type { StressSettings } from "../../../shared/types/voxlab/stress-types.js";
import { EffectsManager } from "../effects/effects-manager.js";
import type { LightingManager } from "./lighting-manager.js";
import type { MeshManager } from "../mesh/mesh-manager.js";
import { MotionManager } from "../timeline/motion-manager.js";
import { StressShaderManager } from "../effects/stress-shader-manager.js";
import type { ViewportManager } from "../viewport/viewport-manager.js";
import { wireEffectEvents, wireGridAxes, wireViewportEvents } from "./augment-manager-wiring.js";
import { wireLightEvents } from "./scene-augment-lights.js";
import { wireMaterialEvents } from "./scene-augment-material.js";

const DEFAULT_STRESS: StressSettings = { enabled: false, radius: 0.6, lerp: 0.14, glowColor: "#f5ca7a" };

export interface SceneAugmentDeps {
    viewport: ViewportManager;
    meshes: MeshManager;
    cursor: CursorService;
    footer: FooterPanelComponent;
    lighting: LightingManager;
}

export class SceneAugmentManager {
    readonly effects: EffectsManager;
    readonly motion: MotionManager;
    readonly stress: StressShaderManager;
    private readonly viewport: ViewportManager;
    private readonly meshes: MeshManager;
    private readonly footer: FooterPanelComponent;
    private readonly lighting: LightingManager;
    private materialAggregate: MaterialSettings = { ...DEFAULT_MATERIAL_SETTINGS };
    private lightAggregate: LightSettings = { ...DEFAULT_LIGHTING };
    private effectsAggregate: EffectsSettings = { ...DEFAULT_EFFECTS };
    dispose(): void {
        this.effects.dispose();
    }
    constructor(deps: SceneAugmentDeps) {
        const { viewport, meshes, cursor, footer, lighting } = deps;
        this.viewport = viewport;
        this.meshes = meshes;
        this.footer = footer;
        this.lighting = lighting;
        const stageBox = viewport.stage.getBoundingClientRect();
        this.effects = new EffectsManager(viewport.renderer, viewport.scene, viewport.camera, {
            width: Math.max(stageBox.width, 1),
            height: Math.max(stageBox.height, 1),
        });
        this.motion = new MotionManager(cursor);
        this.stress = new StressShaderManager(cursor);

        viewport.useEffects(this.effects);
        viewport.useMotion(this.motion);
        viewport.useStress(this.stress);
        viewport.setAnimatedGroup(meshes.meshGroup);
        this.stress.bind(viewport.camera);

        this.wireMeshEvents();
        this.wireFooterEvents();
    }

    private wireMeshEvents(): void {
        this.meshes.addEventListener("material-created", (e) => {
            const mat = (e as CustomEvent<Material>).detail;
            if (mat instanceof MeshStandardMaterial) {
                this.stress.inject(mat);
            }
        });
        this.meshes.addEventListener("mesh-loaded", (e) => {
            const mesh = (e as CustomEvent<Mesh>).detail;
            this.effects.setSelectedObjects([mesh]);
        });
        this.meshes.addEventListener("changed", () => this.viewport.markDirty());
    }

    private wireResetAll(): void {
        this.footer.addEventListener("reset-all", () => {
            this.materialAggregate = { ...DEFAULT_MATERIAL_SETTINGS };
            this.lightAggregate = { ...DEFAULT_LIGHTING };
            this.effectsAggregate = { ...DEFAULT_EFFECTS };
            this.meshes.applyMaterialSettings(this.materialAggregate);
            this.lighting.applySettings(this.lightAggregate);
            this.lighting.applyEnvironment({ ...DEFAULT_ENVIRONMENT });
            this.lighting.applyHemisphere({ ...DEFAULT_HEMISPHERE });
            this.lighting.applyRim({ ...DEFAULT_RIM_LIGHT });
            this.lighting.applyTop({ ...DEFAULT_TOP_LIGHT });
            this.lighting.applyBottom({ ...DEFAULT_BOTTOM_LIGHT });
            this.effects.applySettings(this.effectsAggregate);
            this.motion.updateSettings({ ...DEFAULT_MOTION });
            this.stress.updateSettings({ ...DEFAULT_STRESS });
            this.applyCameraSettings({ ...DEFAULT_CAMERA });
            this.applyMeshSettings({ ...DEFAULT_MESH_SETTINGS });
        });
    }

    private wireFooterEvents(): void {
        wireMaterialEvents({ footer: this.footer, meshes: this.meshes, materialAggregate: this.materialAggregate });
        wireLightEvents({ footer: this.footer, lighting: this.lighting, lightAggregate: this.lightAggregate });
        wireGridAxes({
            footer: this.footer,
            effects: this.effects,
            effectsAggregate: this.effectsAggregate,
            viewport: this.viewport,
        });
        wireEffectEvents({ footer: this.footer, effects: this.effects, effectsAggregate: this.effectsAggregate });
        wireViewportEvents({
            footer: this.footer,
            viewport: this.viewport,
            motion: this.motion,
            stress: this.stress,
            applyCameraSettings: (s) => this.applyCameraSettings(s),
            applyMeshSettings: (s) => this.applyMeshSettings(s),
        });
        this.wireResetAll();
    }

    private applyMeshSettings(settings: MeshSettings): void {
        this.meshes.setUniformScale(settings.scale);
    }

    private applyCameraSettings(settings: CameraSettings): void {
        this.viewport.setFov(settings.fov);
        this.viewport.setNear(settings.near);
        this.viewport.setFar(settings.far);
        this.viewport.setDampingFactor(settings.dampingFactor);
        this.viewport.setCameraPosition(settings.positionX, settings.positionY, settings.positionZ);
        this.viewport.setCameraTarget(settings.targetX, settings.targetY, settings.targetZ);
    }
}
