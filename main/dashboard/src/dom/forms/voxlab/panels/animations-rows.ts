import { button, div, span, type Instance } from "../../../factory/index.js";
import { BUILTIN_ANIMATION_PRESETS } from "../../../../shared/constants/voxlab/presets/presets-constants.js";
import type { AnimationCategory, AnimationPresetDefinition } from "../../../../shared/types/voxlab/preset-def-types.js";

const CLS_GROUP_TITLE = "voxlab-panel__title";
const CLS_ROW = "voxlab-panel__row";
const CLS_ROW_NAME = "voxlab-panel__row-name";
const CLS_ROW_ACTIONS = "voxlab-panel__row-actions";
const CLS_BTN = "voxlab-panel__row-btn";

const CATEGORIES: AnimationCategory[] = ["Camera", "Material", "Lighting", "Post-FX", "Combo"];

export function makePresetRow(preset: AnimationPresetDefinition, onApply: () => void): Instance {
    const applyBtn = button({
        classes: [CLS_BTN],
        text: "Apply",
        title: `${preset.defaultDurationMs}ms default`,
        onClick: onApply,
        context: `apply animation preset ${preset.id}`,
        meta: ["action"],
    });
    return div({ classes: [CLS_ROW], context: null, meta: null }, [
        span({
            classes: [CLS_ROW_NAME],
            text: preset.name,
            title: preset.description,
            context: null,
            meta: null,
        }),
        div({ classes: [CLS_ROW_ACTIONS], context: null, meta: null }, [applyBtn]),
    ]);
}

export function buildLibraryChildren(onApplyPreset: (preset: AnimationPresetDefinition) => void): Instance[] {
    const children: Instance[] = [];
    for (const category of CATEGORIES) {
        const presets = BUILTIN_ANIMATION_PRESETS.filter((p) => p.category === category);
        if (presets.length === 0) continue;
        children.push(div({ classes: [CLS_GROUP_TITLE], text: category, context: null, meta: null }));
        for (const preset of presets) {
            children.push(makePresetRow(preset, () => onApplyPreset(preset)));
        }
    }
    return children;
}

export function buildActiveRow(id: string, onRemove: (id: string, label: string) => void): Instance {
    const preset = BUILTIN_ANIMATION_PRESETS.find((p) => p.id === id);
    const labelText = preset ? preset.name : id;
    const rm = button({
        classes: [CLS_BTN],
        text: "✕",
        title: "Remove this preset's keyframes",
        onClick: () => onRemove(id, labelText),
        context: `remove animation preset ${id}`,
        meta: ["action", "destructive"],
    });
    return div({ classes: [CLS_ROW], context: null, meta: null }, [
        span({ classes: [CLS_ROW_NAME], text: labelText, context: null, meta: null }),
        div({ classes: [CLS_ROW_ACTIONS], context: null, meta: null }, [rm]),
    ]);
}
