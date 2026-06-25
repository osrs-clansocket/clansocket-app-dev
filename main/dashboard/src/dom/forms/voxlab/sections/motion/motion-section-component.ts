import { div, heading } from "../../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../../managers/voxlab/base/base-voxlab-component.js";
import {
    buildBobKit,
    buildBreatheKit,
    buildTiltKit,
    type BobKit,
    type BreatheKit,
    type TiltKit,
} from "./motion-section-sliders.js";
import { snapshotRegistry } from "../../../../../state/voxlab/registries/snapshot-registry.js";
import { DEFAULT_MOTION } from "../../../../../shared/constants/voxlab/motion-constants.js";
import type { MotionSettings } from "../../../../../shared/types/voxlab/motion-types.js";
import { definePanel } from "../../../../../state/voxlab/registries/layout-panel-registry.js";
import { MOTION_PATHS } from "./motion-section-paths.js";

const CLS_SECTION = "voxlab__footer-section";
const CLS_HEADING = "voxlab__footer-section-heading";

type MotionRangeKey = "breatheAmplitude" | "breathePeriodMs" | "bobAmplitude" | "bobPeriodMs" | "tiltStrength";

interface MotionInputs {
    breatheEnabled: HTMLInputElement;
    breatheAmplitude: HTMLInputElement;
    breathePeriod: HTMLInputElement;
    bobEnabled: HTMLInputElement;
    bobAmplitude: HTMLInputElement;
    bobPeriod: HTMLInputElement;
    tiltEnabled: HTMLInputElement;
    tiltStrength: HTMLInputElement;
}

export class MotionSectionComponent extends BaseVoxlabComponent {
    private settings: MotionSettings = { ...DEFAULT_MOTION };
    private inputs: MotionInputs | null = null;

    constructor() {
        super();
        snapshotRegistry.register<MotionSettings>({
            name: "motion",
            getState: () => this.current,
            applyState: (state, opts) => this.apply(state, opts),
            paths: MOTION_PATHS,
        });
    }

    get current(): MotionSettings {
        return { ...this.settings };
    }

    apply(state: MotionSettings, opts?: { silent?: boolean }): void {
        this.settings = { ...state };
        if (this.inputs !== null) {
            this.inputs.breatheEnabled.checked = this.settings.breatheEnabled;
            this.inputs.breatheAmplitude.value = String(this.settings.breatheAmplitude);
            this.inputs.breathePeriod.value = String(this.settings.breathePeriodMs);
            this.inputs.bobEnabled.checked = this.settings.bobEnabled;
            this.inputs.bobAmplitude.value = String(this.settings.bobAmplitude);
            this.inputs.bobPeriod.value = String(this.settings.bobPeriodMs);
            this.inputs.tiltEnabled.checked = this.settings.tiltEnabled;
            this.inputs.tiltStrength.value = String(this.settings.tiltStrength);
        }
        if (!opts?.silent) this.emit<MotionSettings>("motion-change", this.current);
    }

    reset(): void {
        this.apply({ ...DEFAULT_MOTION });
    }

    private buildMotionSection(args: { breathe: BreatheKit; bob: BobKit; tilt: TiltKit }): ReturnType<typeof div> {
        const { breathe, bob, tilt } = args;
        return div({ classes: [CLS_SECTION], context: null, meta: null }, [
            heading("h3", { classes: [CLS_HEADING], text: "Motion", context: null, meta: null }),
            breathe.breatheEnabled.wrapper,
            breathe.breatheAmplitude.wrapper,
            breathe.breathePeriod.wrapper,
            bob.bobEnabled.wrapper,
            bob.bobAmplitude.wrapper,
            bob.bobPeriod.wrapper,
            tilt.tiltEnabled.wrapper,
            tilt.tiltStrength.wrapper,
        ]);
    }

    protected build(): HTMLElement {
        const breathe = buildBreatheKit();
        const bob = buildBobKit();
        const tilt = buildTiltKit();
        const section = this.buildMotionSection({ breathe, bob, tilt });
        this.inputs = {
            breatheEnabled: breathe.breatheEnabled.input,
            breatheAmplitude: breathe.breatheAmplitude.input,
            breathePeriod: breathe.breathePeriod.input,
            bobEnabled: bob.bobEnabled.input,
            bobAmplitude: bob.bobAmplitude.input,
            bobPeriod: bob.bobPeriod.input,
            tiltEnabled: tilt.tiltEnabled.input,
            tiltStrength: tilt.tiltStrength.input,
        };
        this.wireInputs(this.inputs);
        return section.el;
    }

    private wireCheckbox(
        input: HTMLInputElement,
        key: "breatheEnabled" | "bobEnabled" | "tiltEnabled",
        emitChange: () => void,
    ): void {
        input.addEventListener("change", () => {
            this.settings[key] = input.checked;
            emitChange();
        });
    }

    private wireRange(input: HTMLInputElement, key: MotionRangeKey, emitChange: () => void): void {
        input.addEventListener("input", () => {
            this.settings[key] = Number.parseFloat(input.value);
            emitChange();
        });
    }

    private wireInputs(inputs: MotionInputs): void {
        const emitChange = (): void => this.emit<MotionSettings>("motion-change", this.current);
        this.wireCheckbox(inputs.breatheEnabled, "breatheEnabled", emitChange);
        this.wireRange(inputs.breatheAmplitude, "breatheAmplitude", emitChange);
        this.wireRange(inputs.breathePeriod, "breathePeriodMs", emitChange);
        this.wireCheckbox(inputs.bobEnabled, "bobEnabled", emitChange);
        this.wireRange(inputs.bobAmplitude, "bobAmplitude", emitChange);
        this.wireRange(inputs.bobPeriod, "bobPeriodMs", emitChange);
        this.wireCheckbox(inputs.tiltEnabled, "tiltEnabled", emitChange);
        this.wireRange(inputs.tiltStrength, "tiltStrength", emitChange);
    }
}

definePanel({
    id: "motion",
    title: "Motion",
    defaultSide: "left",
    order: 10,
    accessor: (f) => f.motion,
});
