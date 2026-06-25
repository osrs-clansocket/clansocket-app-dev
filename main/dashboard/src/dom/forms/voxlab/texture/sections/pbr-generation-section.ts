import { button, div, heading, type Instance } from "../../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../../managers/voxlab/base/base-voxlab-component.js";
import { createToggleInput } from "../../../../../voxlab/formatters/control-formatter.js";
import {
    DEFAULT_AO_RADIUS,
    DEFAULT_METALNESS_THRESHOLD,
    DEFAULT_PBR_GENERATION_CHANNELS,
    DEFAULT_SOBEL_STRENGTH,
} from "../../../../../shared/constants/voxlab/pbr-generation-constants.js";
import { snapshotRegistry } from "../../../../../state/voxlab/registries/snapshot-registry.js";
import type { PbrGenerate } from "../../../../../shared/types/voxlab/paint/paint-types.js";
import { buildPbrSliders } from "./pbr-generation-sliders.js";

const CLS_SECTION = "voxlab__footer-section";
const CLS_HEADING = "voxlab__footer-section-heading";
const CLS_BTN_PRIMARY = "voxlab__dropdown-btn-primary";

const DEFAULT_PBR_GENERATE_SETTINGS: PbrGenerate = {
    ...DEFAULT_PBR_GENERATION_CHANNELS,
    sobelStrength: DEFAULT_SOBEL_STRENGTH,
    metalnessThreshold: DEFAULT_METALNESS_THRESHOLD,
    aoRadius: DEFAULT_AO_RADIUS,
};

type ChannelKey = "normal" | "roughness" | "metalness" | "ao";

export class PbrGenerationSection extends BaseVoxlabComponent {
    private settings: PbrGenerate = { ...DEFAULT_PBR_GENERATE_SETTINGS };
    private inputs!: {
        normal: HTMLInputElement;
        roughness: HTMLInputElement;
        metalness: HTMLInputElement;
        ao: HTMLInputElement;
        sobelStrength: HTMLInputElement;
        metalnessThreshold: HTMLInputElement;
        aoRadius: HTMLInputElement;
    };

    constructor() {
        super();
        snapshotRegistry.register<PbrGenerate>({
            name: "pbrGenerationChannels",
            getState: () => ({ ...this.settings }),
            applyState: (state) => this.apply(state),
            paths: [],
        });
    }

    get current(): PbrGenerate {
        return { ...this.settings };
    }

    apply(state: PbrGenerate): void {
        this.settings = { ...state };
        if (this.inputs) {
            this.inputs.normal.checked = this.settings.normal;
            this.inputs.roughness.checked = this.settings.roughness;
            this.inputs.metalness.checked = this.settings.metalness;
            this.inputs.ao.checked = this.settings.ao;
            this.inputs.sobelStrength.value = String(this.settings.sobelStrength);
            this.inputs.metalnessThreshold.value = String(this.settings.metalnessThreshold);
            this.inputs.aoRadius.value = String(this.settings.aoRadius);
        }
    }

    reset(): void {
        this.apply({ ...DEFAULT_PBR_GENERATE_SETTINGS });
    }

    private buildChannelToggles(): {
        normal: ReturnType<PbrGenerationSection["makeChannelToggle"]>;
        roughness: ReturnType<PbrGenerationSection["makeChannelToggle"]>;
        metalness: ReturnType<PbrGenerationSection["makeChannelToggle"]>;
        ao: ReturnType<PbrGenerationSection["makeChannelToggle"]>;
    } {
        return {
            normal: this.makeChannelToggle("Derive normal", "normal"),
            roughness: this.makeChannelToggle("Derive roughness", "roughness"),
            metalness: this.makeChannelToggle("Derive metalness", "metalness"),
            ao: this.makeChannelToggle("Derive AO", "ao"),
        };
    }

    private buildGenerateBtn(): Instance<HTMLButtonElement> {
        return button({
            classes: [CLS_BTN_PRIMARY],
            text: "Generate PBR from albedo",
            ariaLabel: "Generate selected PBR maps from current albedo",
            onClick: () => this.emit<PbrGenerate>("pbr-generate", { ...this.settings }),
            context: "generate PBR maps from albedo",
            meta: ["action"],
        });
    }

    protected build(): HTMLElement {
        const toggles = this.buildChannelToggles();
        const sliders = buildPbrSliders(this.settings, () => this.emitChange());
        this.inputs = {
            normal: toggles.normal.input,
            roughness: toggles.roughness.input,
            metalness: toggles.metalness.input,
            ao: toggles.ao.input,
            sobelStrength: sliders.sobel.input,
            metalnessThreshold: sliders.threshold.input,
            aoRadius: sliders.ao.input,
        };
        const section = div({ classes: [CLS_SECTION], context: null, meta: null }, [
            heading("h3", { classes: [CLS_HEADING], text: "PBR generation", context: null, meta: null }),
            toggles.normal.wrapper,
            toggles.roughness.wrapper,
            toggles.metalness.wrapper,
            toggles.ao.wrapper,
            sliders.sobel.wrapper,
            sliders.threshold.wrapper,
            sliders.ao.wrapper,
            this.buildGenerateBtn(),
        ]);
        return section.el;
    }

    private makeChannelToggle(labelText: string, key: ChannelKey): { wrapper: HTMLElement; input: HTMLInputElement } {
        const toggle = createToggleInput({ label: labelText, checked: this.settings[key] });
        toggle.input.addEventListener("change", () => {
            this.settings[key] = toggle.input.checked;
            this.emitChange();
        });
        return toggle;
    }

    private emitChange(): void {
        this.emit<PbrGenerate>("pbr-generation-change", { ...this.settings });
    }
}
