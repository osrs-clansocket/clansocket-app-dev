import { button, div, heading, type Instance } from "../../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../../managers/voxlab/base/base-voxlab-component.js";
import { createColorInput } from "../../../../../voxlab/formatters/control-formatter.js";
import {
    pathColor,
    snapshotRegistry,
    type PathSpec,
} from "../../../../../state/voxlab/registries/snapshot-registry.js";
import { DEFAULT_PARTS_SECTION_STATE } from "../../../../../shared/constants/voxlab/texture-paint-constants.js";
import type {
    MeshPart,
    PartsFill,
    PartsReset,
    PartsSectionState,
} from "../../../../../shared/types/voxlab/paint/paint-types.js";

const CLS_SECTION = "voxlab__footer-section";
const CLS_HEADING = "voxlab__footer-section-heading";
const CLS_ROW = "voxlab__dropdown-button-row";

const PARTS_SECTION_PATHS: ReadonlyArray<PathSpec> = [pathColor("color", "color")];

export class PartsSection extends BaseVoxlabComponent {
    private settings: PartsSectionState = { ...DEFAULT_PARTS_SECTION_STATE };
    private colorInput!: HTMLInputElement;

    constructor() {
        super();
        snapshotRegistry.register<PartsSectionState>({
            name: "partsSection",
            getState: () => this.current,
            applyState: (state, opts) => this.apply(state, opts),
            paths: PARTS_SECTION_PATHS,
        });
    }

    get current(): PartsSectionState {
        return { ...this.settings };
    }

    apply(state: PartsSectionState, opts?: { silent?: boolean }): void {
        this.settings = { ...state };
        if (this.colorInput) this.colorInput.value = this.settings.color;
        if (!opts?.silent) this.emit<PartsSectionState>("parts-section-change", this.current);
    }

    reset(): void {
        this.apply({ ...DEFAULT_PARTS_SECTION_STATE });
    }

    protected build(): HTMLElement {
        const colorPicker = createColorInput({ label: "Color", value: this.settings.color });
        colorPicker.input.addEventListener("input", () => {
            this.settings.color = colorPicker.input.value;
            this.emit<PartsSectionState>("parts-section-change", this.current);
        });
        this.colorInput = colorPicker.input;

        const section = div({ classes: [CLS_SECTION], context: null, meta: null }, [
            heading("h3", { classes: [CLS_HEADING], text: "Parts", context: null, meta: null }),
            colorPicker.wrapper,
            this.makePartRow("Front", "front"),
            this.makePartRow("Back", "back"),
            this.makePartRow("Sides", "sides"),
        ]);
        return section.el;
    }

    private makePartRow(labelText: string, part: MeshPart): Instance {
        const fillBtn = button({
            text: `Fill ${labelText}`,
            ariaLabel: `Fill ${labelText} with current color`,
            onClick: () => this.emit<PartsFill>("parts-fill", { part, color: this.settings.color }),
            context: `fill ${labelText} part with current color`,
            meta: ["action"],
        });
        const resetBtn = button({
            text: `Reset ${labelText}`,
            ariaLabel: `Reset ${labelText} to source-derived colors`,
            onClick: () => this.emit<PartsReset>("parts-reset", { part }),
            context: `reset ${labelText} part to source colors`,
            meta: ["action"],
        });
        return div({ classes: [CLS_ROW], context: null, meta: null }, [fillBtn, resetBtn]);
    }
}
