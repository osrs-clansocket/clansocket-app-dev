import type { TabConcerns } from "./panel-defs-types.js";

const DEFAULT_OPEN = true as const;

export const PREFERENCES_TAB: TabConcerns = {
    concerns: [
        {
            id: "addressing",
            title: "Addressing you",
            icon: "at",
            defaultOpen: DEFAULT_OPEN,
            rows: [["ai_address_form", "ai_pronouns"]],
        },
        {
            id: "display-format",
            title: "Display format",
            icon: "calendar3",
            defaultOpen: DEFAULT_OPEN,
            rows: [["ai_time_format", "ai_date_format"]],
        },
        {
            id: "output-style",
            title: "Output style",
            icon: "text-paragraph",
            rows: ["ai_reaction_ceiling", "ai_verbosity_default", "ai_markdown_policy", "ai_time_narration_policy"],
        },
        {
            id: "domain-focus",
            title: "Domain focus",
            icon: "compass",
            rows: ["ai_domain_priorities", "ai_watched_rsns", "ai_topic_avoids"],
            requiresMode: "mode_continuous",
        },
    ],
};
