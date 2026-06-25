import { readStored, writeStored } from "../../../../state/persistence/index.js";

const TAB_STORAGE_KEY = "clansocket:voxlab.tab.right";
const FALLBACK_TAB = "display";
const LEGACY_TABS = new Set(["load", "controls", "convert", "stats"]);
const VALID_TABS = new Set(["display", "camera", "scene", "export", "actions"]);

export const TAB_DEFS: ReadonlyArray<{ id: string; label: string }> = [
    { id: "display", label: "Display" },
    { id: "camera", label: "Camera" },
    { id: "scene", label: "Scene" },
    { id: "export", label: "Export" },
    { id: "actions", label: "Actions" },
];

export function loadTabSelection(): string {
    const raw = readStored<string>(TAB_STORAGE_KEY);
    if (!raw) return FALLBACK_TAB;
    if (LEGACY_TABS.has(raw)) return FALLBACK_TAB;
    if (VALID_TABS.has(raw)) return raw;
    return FALLBACK_TAB;
}

export function saveTabSelection(id: string): void {
    writeStored(TAB_STORAGE_KEY, id);
}
