import { button, div, heading } from "../../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../../managers/voxlab/base/base-voxlab-component.js";
import { createFilePicker, type FilePickerHandle } from "../../../glass/inputs/glass-file.js";
import { downsample } from "../../../../../voxlab/mappers/downsample-mapper.js";
import {
    DEFAULT_PBR_MAPS_SETTINGS,
    MAX_UPLOAD_TEXTURE_DIM,
    PBR_SLOT_ORDER,
} from "../../../../../shared/constants/voxlab/texture-paint-constants.js";
import { snapshotRegistry } from "../../../../../state/voxlab/registries/snapshot-registry.js";
import type {
    PbrMapSlot,
    PbrMapsChange,
    PbrMapsSettings,
} from "../../../../../shared/types/voxlab/paint/paint-types.js";
import {
    buildIntensitySliders,
    INTENSITY_TO_SLOT,
    SLOT_HUMAN_LABELS,
    SLOT_LABELS,
    type IntensityKey,
} from "./pbr-maps-sliders.js";

const CLS_SECTION = "voxlab__footer-section";
const CLS_HEADING = "voxlab__footer-section-heading";
const CLS_BTN_PRIMARY = "voxlab__dropdown-btn-primary";

export class PbrMapsSection extends BaseVoxlabComponent {
    private settings: PbrMapsSettings = { ...DEFAULT_PBR_MAPS_SETTINGS };
    private pickers: Partial<Record<PbrMapSlot, FilePickerHandle>> = {};
    private intensityInputs: Partial<Record<IntensityKey, HTMLInputElement>> = {};

    constructor() {
        super();
        snapshotRegistry.register<PbrMapsSettings>({
            name: "pbrMaps",
            getState: () => ({ ...this.settings }),
            applyState: (state, opts) => this.apply(state, opts),
            paths: [],
        });
    }

    get current(): PbrMapsSettings {
        return { ...this.settings };
    }

    apply(state: PbrMapsSettings, opts?: { silent?: boolean }): void {
        this.settings = { ...state };
        if (this.intensityInputs.normalScale)
            this.intensityInputs.normalScale.value = String(this.settings.normalScale);
        if (this.intensityInputs.roughnessIntensity)
            this.intensityInputs.roughnessIntensity.value = String(this.settings.roughnessIntensity);
        if (this.intensityInputs.metalnessIntensity)
            this.intensityInputs.metalnessIntensity.value = String(this.settings.metalnessIntensity);
        if (this.intensityInputs.aoIntensity)
            this.intensityInputs.aoIntensity.value = String(this.settings.aoIntensity);
        this.updateEnabled();
        if (!opts?.silent) this.emit<PbrMapsChange>("pbr-maps-change", { ...this.settings });
    }

    reset(): void {
        this.apply({ ...DEFAULT_PBR_MAPS_SETTINGS });
        for (const slot of PBR_SLOT_ORDER) this.pickers[slot]?.clear();
    }

    protected build(): HTMLElement {
        const children: HTMLElement[] = [];
        for (const slot of PBR_SLOT_ORDER) children.push(...this.buildSlot(slot));
        const emit = (next: PbrMapsChange): void => this.emit<PbrMapsChange>("pbr-maps-change", next);
        children.push(...buildIntensitySliders(this.settings, emit, this.intensityInputs));
        const section = div({ classes: [CLS_SECTION], context: null, meta: null }, [
            heading("h3", { classes: [CLS_HEADING], text: "PBR maps", context: null, meta: null }),
            ...children,
        ]);
        this.updateEnabled();
        return section.el;
    }

    private wirePickerChange(picker: ReturnType<typeof createFilePicker>, slot: PbrMapSlot): void {
        picker.input.addEventListener("change", () => {
            const file = picker.getCurrent();
            if (!file) return;
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                const result = reader.result;
                if (typeof result !== "string") return;
                void downsample(result, MAX_UPLOAD_TEXTURE_DIM).then((capped) => {
                    this.settings[slot] = capped;
                    this.updateEnabled();
                    this.emit<PbrMapsChange>("pbr-maps-change", { ...this.settings });
                });
            });
            reader.readAsDataURL(file);
        });
    }

    private buildSlot(slot: PbrMapSlot): HTMLElement[] {
        const picker = createFilePicker({
            label: SLOT_LABELS[slot],
            accept: "image/*",
            ariaLabel: `Upload ${SLOT_LABELS[slot]}`,
        });
        this.wirePickerChange(picker, slot);
        this.pickers[slot] = picker;
        const clearBtn = button({
            classes: [CLS_BTN_PRIMARY],
            text: `Clear ${slot}`,
            ariaLabel: `Clear ${SLOT_LABELS[slot]}`,
            onClick: () => {
                this.settings[slot] = null;
                picker.clear();
                this.updateEnabled();
                this.emit<PbrMapsChange>("pbr-maps-change", { ...this.settings });
            },
            context: `clear ${slot} PBR map`,
            meta: ["action"],
        });
        return [picker.wrapper, clearBtn.el];
    }

    private updateEnabled(): void {
        for (const key of Object.keys(INTENSITY_TO_SLOT) as IntensityKey[]) {
            const slider = this.intensityInputs[key];
            if (!slider) continue;
            const slot = INTENSITY_TO_SLOT[key];
            const hasMap = this.settings[slot] !== null;
            slider.disabled = !hasMap;
            slider.title = hasMap ? "" : `Upload a ${SLOT_HUMAN_LABELS[slot]} map first to enable this slider`;
        }
    }
}
