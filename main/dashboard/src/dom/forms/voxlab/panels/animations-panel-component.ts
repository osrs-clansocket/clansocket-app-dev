import { button, div, type Instance } from "../../../factory/index.js";
import { readStored, writeStored } from "../../../../state/persistence/index.js";
import { BaseVoxlabComponent } from "../../../../managers/voxlab/base/base-voxlab-component.js";
import { modalService } from "../../../../managers/voxlab/services/modal-service.js";
import { buildActiveRow, buildLibraryChildren } from "./animations-rows.js";
import type { AnimationPresetDefinition } from "../../../../shared/types/voxlab/preset-def-types.js";
import type { SceneSnapshot } from "../../../../shared/types/voxlab/snapshot-types.js";

const APPLY_MODE_KEY = "voxlab.animations.fitTimeline";
const CLS_PANEL = "voxlab__presets-panel";
const CLS_GROUP_TITLE = "voxlab-panel__title";
const CLS_LIST = "voxlab__presets-list";
const CLS_BTN = "voxlab-panel__row-btn";
const CLS_EMPTY = "voxlab__actions-empty";

const STYLE_TWO_COL = "display: grid; grid-template-columns: 1fr 1fr; gap: 0;";
const STYLE_BORDER_NONE = "border-right: 0";

export interface AnimationsPanelDeps {
    getSnapshot: () => SceneSnapshot;
    activeIds: () => string[];
    getTimelineDurationMs: () => number;
    getCursorMs: () => number;
    hasTimeline: () => boolean;
    applyPreset: (preset: AnimationPresetDefinition, durationMs: number, cursorOffsetMs: number) => void;
    removePreset: (presetId: string) => void;
    addTimelineListener: (type: string, listener: EventListener) => void;
    removeTimelineListener: (type: string, listener: EventListener) => void;
}

export class AnimationsPanelComponent extends BaseVoxlabComponent {
    private fitToTimeline = true;
    private activeHost!: Instance;
    private listHost!: Instance;
    private fitButton!: Instance<HTMLButtonElement>;
    private cursorButton!: Instance<HTMLButtonElement>;

    constructor(private readonly deps: AnimationsPanelDeps) {
        super();
        const stored = readStored<boolean>(APPLY_MODE_KEY);
        if (stored === false) this.fitToTimeline = false;
    }

    private buildModeButtons(): Instance {
        this.fitButton = button({
            classes: [CLS_BTN],
            text: "Fit timeline",
            style: STYLE_BORDER_NONE,
            onClick: () => this.setFitMode(true),
            context: "set animation apply mode to fit timeline",
            meta: ["action"],
        });
        this.cursorButton = button({
            classes: [CLS_BTN],
            text: "At cursor",
            onClick: () => this.setFitMode(false),
            context: "set animation apply mode to cursor offset",
            meta: ["action"],
        });
        return div({ style: STYLE_TWO_COL, context: null, meta: null }, [this.fitButton, this.cursorButton]);
    }

    private bindTimelineListeners(): void {
        const onChange = (): void => {
            this.refreshActive();
            this.refreshModeButtons();
        };
        this.deps.addTimelineListener("timeline-tracks-changed", onChange);
        this.deps.addTimelineListener("timeline-loaded", onChange);
        this.deps.addTimelineListener("timeline-unloaded", onChange);
    }

    protected build(): HTMLElement {
        const modeRow = this.buildModeButtons();
        this.activeHost = div({ classes: [CLS_LIST], context: null, meta: null });
        this.listHost = div({ classes: [CLS_LIST], context: null, meta: null });
        const panel = div({ classes: [CLS_PANEL], context: null, meta: null }, [
            modeRow,
            div({ classes: [CLS_GROUP_TITLE], text: "Active on timeline", context: null, meta: null }),
            this.activeHost,
            this.listHost,
        ]);
        this.refreshModeButtons();
        this.refreshActive();
        this.listHost.setChildren(...buildLibraryChildren((preset) => void this.applyOne(preset)));
        this.bindTimelineListeners();
        return panel.el;
    }

    private setFitMode(fit: boolean): void {
        this.fitToTimeline = fit;
        writeStored(APPLY_MODE_KEY, fit);
        this.refreshModeButtons();
    }

    private refreshModeButtons(): void {
        if (!this.fitButton) return;
        this.fitButton.el.dataset.active = this.fitToTimeline ? "true" : "false";
        this.cursorButton.el.dataset.active = !this.fitToTimeline ? "true" : "false";
    }

    private refreshActive(): void {
        if (!this.activeHost) return;
        const ids = this.deps.activeIds();
        if (ids.length === 0) {
            this.activeHost.setChildren(
                div({ classes: [CLS_EMPTY], text: "No animation presets on the timeline.", context: null, meta: null }),
            );
            return;
        }
        this.activeHost.setChildren(...ids.map((id) => buildActiveRow(id, (i, l) => void this.confirmRemove(i, l))));
    }

    private async applyOne(preset: AnimationPresetDefinition): Promise<void> {
        if (!this.deps.hasTimeline()) {
            await modalService.alert("Enable the timeline first (Export tab → Start timeline).");
            return;
        }
        const { durationMs, cursorOffsetMs } = this.computeApplyOptions(preset);
        this.deps.applyPreset(preset, durationMs, cursorOffsetMs);
        this.refreshActive();
    }

    private computeApplyOptions(preset: AnimationPresetDefinition): { durationMs: number; cursorOffsetMs: number } {
        if (this.fitToTimeline) {
            const dur = this.deps.getTimelineDurationMs();
            return { durationMs: dur > 0 ? dur : preset.defaultDurationMs, cursorOffsetMs: 0 };
        }
        return { durationMs: preset.defaultDurationMs, cursorOffsetMs: this.deps.getCursorMs() };
    }

    private async confirmRemove(presetId: string, label: string): Promise<void> {
        const ok = await modalService.confirm(`Remove "${label}" keyframes from the timeline?`, {
            danger: true,
            confirmLabel: "Remove",
        });
        if (ok) {
            this.deps.removePreset(presetId);
            this.refreshActive();
        }
    }
}
