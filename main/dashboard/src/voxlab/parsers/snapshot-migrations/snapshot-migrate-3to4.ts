import { isObject } from "../is-object.js";
import { pickKeys } from "../pick-keys.js";
import {
    BLOOM_KEYS,
    GRID_AXES_KEYS,
    LIGHT_AMBIENT_KEYS,
    LIGHT_FILL_KEYS,
    LIGHT_KEY_KEYS,
    MATERIAL_COAT_KEYS,
    MATERIAL_EMISSIVE_KEYS,
    MATERIAL_SURFACE_KEYS,
    OUTLINE_KEYS,
    POSTFX_KEYS,
    QUALITY_KEYS,
    WORLD_KEYS,
} from "../../../shared/constants/voxlab/section-keys.js";

interface Migrate3to4Sources {
    material: Record<string, unknown>;
    light: Record<string, unknown>;
    effectsInner: Record<string, unknown>;
    stressInner: Record<string, unknown>;
    worldSource: Record<string, unknown>;
}

function collect3to4Sources(parts: Record<string, unknown>): Migrate3to4Sources {
    const material = isObject(parts.material) ? (parts.material as Record<string, unknown>) : {};
    const scene = isObject(parts.scene) ? (parts.scene as Record<string, unknown>) : {};
    const effectsContainer = isObject(parts.effects) ? (parts.effects as Record<string, unknown>) : {};
    const effectsInner = isObject(effectsContainer.effects)
        ? (effectsContainer.effects as Record<string, unknown>)
        : {};
    const stressInner = isObject(effectsContainer.stress) ? (effectsContainer.stress as Record<string, unknown>) : {};
    const light = isObject(parts.light) ? (parts.light as Record<string, unknown>) : {};
    return { material, light, effectsInner, stressInner, worldSource: { ...effectsInner, ...scene } };
}

function applyMaterialPicks(parts: Record<string, unknown>, src: Migrate3to4Sources): void {
    parts.surface = pickKeys(src.material, MATERIAL_SURFACE_KEYS);
    parts.emissive = pickKeys(src.material, MATERIAL_EMISSIVE_KEYS);
    parts.coatSheen = pickKeys(src.material, MATERIAL_COAT_KEYS);
    parts.ambient = pickKeys(src.light, LIGHT_AMBIENT_KEYS);
    parts.keyLight = pickKeys(src.light, LIGHT_KEY_KEYS);
    parts.fillLight = pickKeys(src.light, LIGHT_FILL_KEYS);
}

function applyEffectsPicks(parts: Record<string, unknown>, src: Migrate3to4Sources): void {
    parts.world = pickKeys(src.worldSource, WORLD_KEYS);
    parts.gridAxes = pickKeys(src.worldSource, GRID_AXES_KEYS);
    parts.bloom = pickKeys(src.effectsInner, BLOOM_KEYS);
    parts.outline = pickKeys(src.effectsInner, OUTLINE_KEYS);
    parts.postFx = pickKeys(src.effectsInner, POSTFX_KEYS);
    parts.quality = pickKeys(src.effectsInner, QUALITY_KEYS);
    parts.stress = { ...src.stressInner };
}

export function migrate3to4(raw: Record<string, unknown>): Record<string, unknown> {
    const parts = isObject(raw.parts) ? { ...(raw.parts as Record<string, unknown>) } : {};
    const src = collect3to4Sources(parts);
    applyMaterialPicks(parts, src);
    applyEffectsPicks(parts, src);
    delete parts.material;
    delete parts.scene;
    delete parts.effects;
    delete parts.light;
    return { ...raw, schemaVersion: 4, parts };
}
