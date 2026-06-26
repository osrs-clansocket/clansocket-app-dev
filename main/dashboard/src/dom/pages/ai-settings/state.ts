import { signal } from "../../factory/reactive/index.js";

export type ConcernKey = "memory" | "profile" | "modes" | "persona" | "operation" | "preferences";

export type TabKey = "knowledge" | "modes" | "persona" | "operation" | "preferences";

export interface ConcernDef {
    key: ConcernKey;
    label: string;
    icon: string;
    tagline: string;
}

export interface TabDef {
    key: TabKey;
    label: string;
    concerns: ConcernKey[];
}

export const CONCERNS: ConcernDef[] = [
    { key: "profile", label: "User", icon: "person-fill", tagline: "who you are, in my picture of you" },
    { key: "memory", label: "Memory", icon: "archive-fill", tagline: "what i recall about you, kept across conversations" },
    { key: "modes", label: "Modes", icon: "toggles", tagline: "capabilities on / off; the levers behind everything else" },
    { key: "persona", label: "Persona", icon: "person-vcard-fill", tagline: "identity slots that shape how i sound" },
    { key: "operation", label: "Operation", icon: "shield-shaded", tagline: "policy slots; what i can and cannot do" },
    { key: "preferences", label: "Preferences", icon: "sliders", tagline: "engagement style; how i show up" },
];

export const CONCERN_BY_KEY: Map<ConcernKey, ConcernDef> = new Map(CONCERNS.map((c) => [c.key, c]));

export const TABS: TabDef[] = [
    { key: "knowledge", label: "Knowledge", concerns: ["profile", "memory"] },
    { key: "modes", label: "Modes", concerns: ["modes"] },
    { key: "persona", label: "Persona", concerns: ["persona"] },
    { key: "operation", label: "Operation", concerns: ["operation"] },
    { key: "preferences", label: "Preferences", concerns: ["preferences"] },
];

export const activeTab$ = signal<TabKey>("knowledge");
export const focusedConcern$ = signal<ConcernKey | null>(null);

const TAB_KEYS_SET = new Set<string>(TABS.map((t) => t.key));

export function resolveAiSettingsTab(input: string | null): TabKey {
    if (input !== null && TAB_KEYS_SET.has(input)) return input as TabKey;
    return TABS[0]!.key;
}
