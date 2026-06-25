import { readStored, writeStored } from "../../../../../state/persistence/index.js";

const TAB_STORAGE_KEY = "clansocket:voxlab.tab.left";
const FALLBACK_TAB = "effects";
const VALID_TABS = new Set(["effects", "color", "texture", "mesh", "presets", "light", "animations"]);

export const TAB_DEFS: ReadonlyArray<{ id: string; label: string }> = [
    { id: "effects", label: "Effects" },
    { id: "color", label: "Color" },
    { id: "texture", label: "Texture" },
    { id: "mesh", label: "Mesh" },
    { id: "presets", label: "Presets" },
    { id: "light", label: "Light" },
    { id: "animations", label: "Anim" },
];

export function loadTabSelection(): string {
    const raw = readStored<string>(TAB_STORAGE_KEY);
    if (raw === "room") return "light";
    if (raw && VALID_TABS.has(raw)) return raw;
    return FALLBACK_TAB;
}

export function saveTabSelection(id: string): void {
    writeStored(TAB_STORAGE_KEY, id);
}
