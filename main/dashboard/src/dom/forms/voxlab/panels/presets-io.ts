import { anchor, input } from "../../../factory/index.js";
import { modalService } from "../../../../managers/voxlab/services/modal-service.js";
import type { PresetStorageService, UserPreset } from "../../../../managers/voxlab/services/preset-storage-service.js";
import type { SceneSnapshot } from "../../../../shared/types/voxlab/snapshot-types.js";

const REVOKE_URL_DELAY_MS = 60_000;
const JSON_EXT_PATTERN = ".json";

function stripJsonExt(name: string): string {
    return name.toLowerCase().endsWith(JSON_EXT_PATTERN) ? name.slice(0, -JSON_EXT_PATTERN.length) : name;
}

export function exportSnapshot(storage: PresetStorageService, snapshot: SceneSnapshot, fileStem: string): void {
    const text = storage.serialize(snapshot);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = anchor({
        href: url,
        download: `voxlab-preset-${fileStem}.json`,
        rel: "noopener",
        ariaLabel: `download preset ${fileStem}`,
        context: `download preset file ${fileStem}`,
        meta: ["action"],
    });
    link.mount(document.body);
    link.el.click();
    link.destroy();
    setTimeout(() => URL.revokeObjectURL(url), REVOKE_URL_DELAY_MS);
}

export async function consumeImportFile(
    storage: PresetStorageService,
    picker: HTMLInputElement,
    refresh: () => Promise<void>,
): Promise<void> {
    const file = picker.files?.[0];
    if (!file) return;
    try {
        const text = await file.text();
        const snapshot = storage.deserialize(text);
        const proposed = await modalService.prompt("Name this preset:", stripJsonExt(file.name));
        if (!proposed) return;
        const preset: UserPreset = {
            snapshot,
            id: `user-${performance.now().toString(36)}`,
            name: proposed,
            createdAt: performance.now(),
        };
        await storage.save(preset);
        await refresh();
    } catch (err) {
        await modalService.alert(`Could not import preset: ${err instanceof Error ? err.message : String(err)}`);
    }
}

export function importPreset(storage: PresetStorageService, refresh: () => Promise<void>): void {
    const picker = input({
        type: "file",
        accept: "application/json,.json",
        ariaLabel: "pick preset file to import",
        onChange: () => void consumeImportFile(storage, picker.el, refresh),
        context: "pick preset file to import",
        meta: ["input"],
    });
    picker.el.click();
}

export async function saveCurrentPreset(
    storage: PresetStorageService,
    getSnapshot: () => SceneSnapshot,
    refresh: () => Promise<void>,
): Promise<void> {
    const proposed = await modalService.prompt("Name this preset:", "My preset");
    if (!proposed) return;
    const snapshot = getSnapshot();
    const preset: UserPreset = {
        snapshot,
        id: `user-${performance.now().toString(36)}`,
        name: proposed,
        createdAt: performance.now(),
    };
    await storage.save(preset);
    await refresh();
}

export async function deletePresetId(
    storage: PresetStorageService,
    id: string,
    refresh: () => Promise<void>,
): Promise<void> {
    const ok = await modalService.confirm("Delete this preset?", { danger: true, confirmLabel: "Delete" });
    if (!ok) return;
    await storage.deleteById(id);
    await refresh();
}
