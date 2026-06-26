import type { TabConcerns } from "./panel-defs-types.js";

const DEFAULT_OPEN = true as const;

export const PERSONA_TAB: TabConcerns = {
    concerns: [
        {
            id: "identity",
            title: "Identity",
            icon: "person-badge",
            defaultOpen: DEFAULT_OPEN,
            rows: [["ai_name", "ai_role_tagline"], "ai_idk_form"],
        },
        {
            id: "voice",
            title: "Voice",
            icon: "megaphone",
            defaultOpen: DEFAULT_OPEN,
            rows: ["ai_voice_directive", "ai_voice_dna", "ai_anti_voice"],
        },
        {
            id: "vocab",
            title: "Vocab",
            icon: "collection",
            rows: ["ai_phrase_banks"],
        },
        {
            id: "banter",
            title: "Banter",
            icon: "fire",
            rows: ["ai_shittalk_doctrine", "ai_inside_jokes"],
            requiresMode: "mode_banter",
        },
        {
            id: "refusals",
            title: "Refusals",
            icon: "sign-do-not-enter",
            rows: ["ai_lane_out", "ai_deflect_phrasings"],
        },
        {
            id: "reactions",
            title: "Reactions",
            icon: "graph-up",
            rows: ["ai_reaction_calibration", "ai_celebration_rules", "ai_fumble_recovery", "ai_swear_policy"],
            requiresMode: "mode_spontaneous_reactions",
        },
    ],
};
