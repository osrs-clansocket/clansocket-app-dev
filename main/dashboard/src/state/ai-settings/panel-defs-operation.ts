import type { TabConcerns } from "./panel-defs.js";

const DEFAULT_OPEN = true as const;

export const OPERATION_TAB: TabConcerns = {
    concerns: [
        {
            id: "cadence-limits",
            title: "Cadence & limits",
            icon: "speedometer",
            defaultOpen: DEFAULT_OPEN,
            rows: [
                ["ai_chain_auto_limit_warn_at", "ai_chain_auto_limit"],
                ["ai_poll_min_seconds", "ai_poll_max_seconds"],
                "ai_history_window",
            ],
            requiresMode: "mode_continuous",
        },
        {
            id: "decision-policy",
            title: "Decision policy",
            icon: "diagram-3",
            rows: ["ai_clarify_threshold", "ai_suggestion_policy", "ai_discovery_verbosity"],
        },
        {
            id: "quiet-hours",
            title: "Quiet hours",
            icon: "moon-stars",
            rows: ["ai_quiet_hours"],
            requiresMode: "mode_continuous",
        },
    ],
};
