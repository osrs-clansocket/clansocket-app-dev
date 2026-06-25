import { button, div, span, type Instance } from "../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../managers/voxlab/base/base-voxlab-component.js";
import type { PresetStorageService, UserPreset } from "../../../../managers/voxlab/services/preset-storage-service.js";
import {
    BUILTIN_PRESETS,
    type BuiltinPreset,
} from "../../../../shared/constants/voxlab/presets/builtin-presets-constants.js";
import { deletePresetId, exportSnapshot, importPreset, saveCurrentPreset } from "./presets-io.js";
import type { SceneSnapshot } from "../../../../shared/types/voxlab/snapshot-types.js";

const CLS_PANEL = "voxlab__presets-panel";
const CLS_ACTION_ROW = "voxlab-panel__row";
const CLS_LIST = "voxlab__presets-list";
const CLS_GROUP_TITLE = "voxlab-panel__title";
const CLS_EMPTY = "voxlab__presets-empty";
const CLS_ROW = "voxlab-panel__row";
const CLS_ROW_NAME = "voxlab-panel__row-name";
const CLS_ROW_ACTIONS = "voxlab-panel__row-actions";
const CLS_ROW_BTN = "voxlab-panel__row-btn";

export interface PresetApplyDetail {
    snapshot: SceneSnapshot;
    name: string;
    source: "builtin" | "user";
}

export interface PresetsPanelDeps {
    storage: PresetStorageService;
    onApply: (detail: PresetApplyDetail) => void;
    onSaveCurrent: () => SceneSnapshot;
}

export class PresetsPanelComponent extends BaseVoxlabComponent {
    private listHost!: Instance;
    private userPresets: UserPreset[] = [];

    constructor(private readonly deps: PresetsPanelDeps) {
        super();
    }

    private buildActionButtons(): Instance[] {
        return [
            this.rowBtn("Import", () => importPreset(this.deps.storage, () => this.refresh()), { borderRight: "0" }),
            this.rowBtn("Export", () => exportSnapshot(this.deps.storage, this.deps.onSaveCurrent(), "current"), {
                borderRight: "0",
            }),
            this.rowBtn(
                "Save",
                () => void saveCurrentPreset(this.deps.storage, this.deps.onSaveCurrent, () => this.refresh()),
            ),
        ];
    }

    protected build(): HTMLElement {
        const actions = div(
            {
                classes: [CLS_ACTION_ROW],
                style: "display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0;",
                context: null,
                meta: null,
            },
            this.buildActionButtons(),
        );
        this.listHost = div({ classes: [CLS_LIST], context: null, meta: null });
        const panel = div({ classes: [CLS_PANEL], context: null, meta: null }, [actions, this.listHost]);
        void this.refresh();
        return panel.el;
    }

    async refresh(): Promise<void> {
        this.userPresets = await this.deps.storage.list();
        this.render();
    }

    private render(): void {
        const countSuffix = this.userPresets.length ? ` (${this.userPresets.length})` : "";
        const userTitleText = `Yours${countSuffix}`;
        const children: Instance[] = [div({ classes: [CLS_GROUP_TITLE], text: "Built-in", context: null, meta: null })];
        for (const builtin of BUILTIN_PRESETS) {
            children.push(this.makeBuiltinRow(builtin));
        }
        children.push(div({ classes: [CLS_GROUP_TITLE], text: userTitleText, context: null, meta: null }));
        if (this.userPresets.length === 0) {
            children.push(div({ classes: [CLS_EMPTY], text: "No presets saved yet", context: null, meta: null }));
        } else {
            const sorted = [...this.userPresets].sort((a, b) => b.createdAt - a.createdAt);
            for (const user of sorted) {
                children.push(this.makeUserRow(user));
            }
        }
        this.listHost.setChildren(...children);
    }

    private makeBuiltinRow(preset: BuiltinPreset): Instance {
        return this.makeRow(preset.name, [
            this.rowBtn("Load", () => {
                this.deps.onApply({ snapshot: preset.snapshot, name: preset.name, source: "builtin" });
            }),
            this.rowBtn("⇩", () => exportSnapshot(this.deps.storage, preset.snapshot, preset.id), {
                title: "Export this preset",
            }),
        ]);
    }

    private makeUserRow(preset: UserPreset): Instance {
        return this.makeRow(preset.name, [
            this.rowBtn("Load", () => {
                this.deps.onApply({ snapshot: preset.snapshot, name: preset.name, source: "user" });
            }),
            this.rowBtn("⇩", () => exportSnapshot(this.deps.storage, preset.snapshot, preset.id), {
                title: "Export this preset",
            }),
            this.rowBtn("✕", () => void deletePresetId(this.deps.storage, preset.id, () => this.refresh()), {
                title: "Delete preset",
            }),
        ]);
    }

    private makeRow(name: string, actions: Instance[]): Instance {
        return div({ classes: [CLS_ROW], context: null, meta: null }, [
            span({ classes: [CLS_ROW_NAME], text: name, context: null, meta: null }),
            div({ classes: [CLS_ROW_ACTIONS], context: null, meta: null }, actions),
        ]);
    }

    private rowBtn(label: string, onClick: () => void, extra?: { borderRight?: string; title?: string }): Instance {
        return button({
            onClick,
            classes: [CLS_ROW_BTN],
            text: label,
            style: extra?.borderRight !== undefined ? `border-right: ${extra.borderRight}` : undefined,
            title: extra?.title,
            context: `preset row action: ${label}`,
            meta: ["action"],
        });
    }
}
