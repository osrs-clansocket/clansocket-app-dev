import { CTRL_BLOCK, CTRL_SELECT, CTRL_TOGGLE, PROSE, type SlotTuple } from "./slots-types.js";

const ADDRESS_OPTIONS = ["rsn", "nickname", "display-name", "none"] as const;
const PRONOUN_OPTIONS = ["she/her", "he/him", "they/them", "it", "none"] as const;
const REACTION_CEILING_OPTIONS = ["muted", "normal", "high"] as const;
const TIME_FMT_OPTIONS = ["12h", "24h"] as const;
const DATE_FMT_OPTIONS = ["DMY", "MDY", "YMD", "ISO"] as const;

export const ENGAGEMENT_TUPLES: readonly SlotTuple[] = [
    [
        "ai_address_form",
        PROSE,
        CTRL_TOGGLE,
        "Address form",
        "at",
        "How the AI addresses you.",
        { options: ADDRESS_OPTIONS },
    ],
    [
        "ai_pronouns",
        PROSE,
        CTRL_SELECT,
        "Pronouns",
        "person",
        "Third-person pronouns for you.",
        { options: PRONOUN_OPTIONS },
    ],
    [
        "ai_time_format",
        PROSE,
        CTRL_TOGGLE,
        "Time format",
        "alarm",
        "12h vs 24h time rendering.",
        { options: TIME_FMT_OPTIONS },
    ],
    [
        "ai_date_format",
        PROSE,
        CTRL_TOGGLE,
        "Date format",
        "calendar3",
        "Date format preference.",
        { options: DATE_FMT_OPTIONS },
    ],
    [
        "ai_reaction_ceiling",
        PROSE,
        CTRL_TOGGLE,
        "Reaction cap",
        "thermometer-half",
        "Max intensity the AI can reach — mutes spontaneous reactions if low.",
        { options: REACTION_CEILING_OPTIONS },
    ],
    [
        "ai_verbosity_default",
        PROSE,
        CTRL_BLOCK,
        "Default verbosity",
        "text-paragraph",
        "How long the AI's default responses are.",
    ],
    [
        "ai_markdown_policy",
        PROSE,
        CTRL_BLOCK,
        "Markdown style",
        "markdown",
        "When the AI uses markdown formatting in messages.",
    ],
    [
        "ai_time_narration_policy",
        PROSE,
        CTRL_BLOCK,
        "Time mentions",
        "clock-history",
        "When the AI mentions the time of day in chat.",
    ],
];
