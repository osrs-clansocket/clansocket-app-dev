import { button, div, heading, type Instance } from "../../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../../managers/voxlab/base/base-voxlab-component.js";
import { buildCameraSliders, type CameraSliderSet } from "./camera-section-sliders.js";

export type CameraIntent = "reset" | "front";
import { snapshotRegistry } from "../../../../../state/voxlab/registries/snapshot-registry.js";
import { DEFAULT_CAMERA } from "../../../../../shared/constants/voxlab/camera-constants.js";
import type { CameraSettings } from "../../../../../shared/types/voxlab/camera-types.js";
import { CAMERA_PATHS } from "./camera-section-paths.js";

const CLS_SECTION = "voxlab__footer-section";
const CLS_HEADING = "voxlab__footer-section-heading";
const CLS_ROW = "voxlab__dropdown-button-row";

import { FIELD_KEYS, type CameraInputs } from "./camera-section-keys.js";

function inputsFromCamera(s: CameraSliderSet): CameraInputs {
    return {
        fov: s.fov.input,
        near: s.near.input,
        far: s.far.input,
        posX: s.posX.input,
        posY: s.posY.input,
        posZ: s.posZ.input,
        tgtX: s.tgtX.input,
        tgtY: s.tgtY.input,
        tgtZ: s.tgtZ.input,
        damping: s.damping.input,
        fitMul: s.fitMul.input,
        frontMul: s.frontMul.input,
    };
}

export class CameraSectionComponent extends BaseVoxlabComponent {
    private settings: CameraSettings = { ...DEFAULT_CAMERA };
    private inputs: CameraInputs | null = null;

    constructor() {
        super();
        snapshotRegistry.register<CameraSettings>({
            name: "camera",
            getState: () => this.current,
            applyState: (state, opts) => this.apply(state, opts),
            paths: CAMERA_PATHS,
        });
    }

    get current(): CameraSettings {
        return { ...this.settings };
    }

    apply(state: CameraSettings, opts?: { silent?: boolean }): void {
        this.settings = { ...state };
        const inputs = this.inputs;
        if (inputs !== null) {
            for (const [k, settingKey] of FIELD_KEYS) {
                inputs[k].value = String(this.settings[settingKey]);
            }
        }
        if (!opts?.silent) this.emit<CameraSettings>("camera-change", this.current);
    }

    syncFrom(state: CameraSettings): void {
        this.apply(state, { silent: true });
    }

    reset(): void {
        this.apply({ ...DEFAULT_CAMERA });
    }

    private buildButtonRow(): Instance {
        const resetBtn = button({
            text: "Reset camera",
            onClick: () => this.emit<CameraIntent>("camera-intent", "reset"),
            context: "reset camera to defaults",
            meta: ["action"],
        });
        const frontBtn = button({
            text: "Front view",
            onClick: () => this.emit<CameraIntent>("camera-intent", "front"),
            context: "frame mesh from front",
            meta: ["action"],
        });
        return div({ classes: [CLS_ROW], context: null, meta: null }, [resetBtn, frontBtn]);
    }

    protected build(): HTMLElement {
        const buttonRow = this.buildButtonRow();
        const s = buildCameraSliders();
        const section = div({ classes: [CLS_SECTION], context: null, meta: null }, [
            heading("h3", { classes: [CLS_HEADING], text: "Camera", context: null, meta: null }),
            buttonRow,
            s.fov.wrapper,
            s.near.wrapper,
            s.far.wrapper,
            s.posX.wrapper,
            s.posY.wrapper,
            s.posZ.wrapper,
            s.tgtX.wrapper,
            s.tgtY.wrapper,
            s.tgtZ.wrapper,
            s.damping.wrapper,
            s.fitMul.wrapper,
            s.frontMul.wrapper,
        ]);
        const inputs = inputsFromCamera(s);
        this.inputs = inputs;
        this.wireInputs(inputs);
        return section.el;
    }

    private wireInputs(inputs: CameraInputs): void {
        const emit = (): void => this.emit<CameraSettings>("camera-change", this.current);
        for (const [k, settingKey] of FIELD_KEYS) {
            const inp = inputs[k];
            inp.addEventListener("input", () => {
                (this.settings[settingKey] as number) = Number.parseFloat(inp.value);
                emit();
            });
        }
    }
}
