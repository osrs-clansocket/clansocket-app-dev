import { div, heading, span, type Instance } from "../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../managers/voxlab/base/base-voxlab-component.js";
import { DropdownComponent, type DropdownChangeDetail } from "../panels/dropdown-component.js";
import { pathStep, snapshotRegistry, type PathSpec } from "../../../../state/voxlab/registries/snapshot-registry.js";
import { TARGET_FPS_OPTIONS } from "../../../../shared/constants/voxlab/effect-constants.js";
import type { TargetFpsFields } from "./split-sections/split-sections.js";

const CLS_SECTION = "voxlab__footer-section";
const CLS_HEADING = "voxlab__footer-section-heading";
const STYLE_ROW = "align-items: baseline; display: flex; justify-content: space-between;";
const STYLE_HEADING = "margin: 0";
const STYLE_FPS_LABEL = "font-variant-numeric: tabular-nums;";
const CLS_FPS_LABEL = "voxlab__footer-fps-label";
const RADIX_DEC = 10;

const DEFAULT_TARGET_FPS: TargetFpsFields = { targetFps: 0 };

const TARGET_FPS_PATHS: ReadonlyArray<PathSpec> = [pathStep("targetFps", "targetFps")];

export class TargetFpsComp extends BaseVoxlabComponent {
    private settings: TargetFpsFields = { ...DEFAULT_TARGET_FPS };
    private dropdown!: DropdownComponent<string>;
    private fpsLabel!: Instance<HTMLSpanElement>;

    constructor() {
        super();
        snapshotRegistry.register<TargetFpsFields>({
            name: "targetFps",
            getState: () => this.current,
            applyState: (state, opts) => this.apply(state, opts),
            paths: TARGET_FPS_PATHS,
        });
    }

    get current(): TargetFpsFields {
        return { ...this.settings };
    }

    apply(state: TargetFpsFields, opts?: { silent?: boolean }): void {
        this.settings = { ...state };
        if (this.dropdown) this.dropdown.select(String(this.settings.targetFps));
        if (!opts?.silent) this.emit<TargetFpsFields>("target-fps-change", this.current);
    }

    reset(): void {
        this.apply({ ...DEFAULT_TARGET_FPS });
    }

    updateRealtimeFps(fps: number): void {
        if (!this.fpsLabel) return;
        this.fpsLabel.setText(`${Math.round(fps)} fps`);
    }

    private buildHeadingRow(): Instance {
        this.fpsLabel = span({
            classes: [CLS_FPS_LABEL],
            style: STYLE_FPS_LABEL,
            text: "— fps",
            context: null,
            meta: null,
        }) as Instance<HTMLSpanElement>;
        return div({ style: STYLE_ROW, context: null, meta: null }, [
            heading("h3", {
                classes: [CLS_HEADING],
                style: STYLE_HEADING,
                text: "Target FPS",
                context: null,
                meta: null,
            }),
            this.fpsLabel,
        ]);
    }

    protected build(): HTMLElement {
        const section = div({ classes: [CLS_SECTION], context: null, meta: null }, [this.buildHeadingRow()]);
        this.dropdown = new DropdownComponent<string>(
            TARGET_FPS_OPTIONS,
            String(this.settings.targetFps),
            "voxlab__dropdown--banner",
        );
        this.dropdown.mount(section.el);
        this.dropdown.addEventListener("change", (e) => {
            const detail = (e as CustomEvent<DropdownChangeDetail<string>>).detail;
            this.settings.targetFps = Number.parseInt(detail.value, RADIX_DEC);
            this.emit<TargetFpsFields>("target-fps-change", this.current);
        });
        return section.el;
    }
}
