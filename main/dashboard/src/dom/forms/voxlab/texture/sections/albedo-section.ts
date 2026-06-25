import { button, div, heading, type Instance } from "../../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../../managers/voxlab/base/base-voxlab-component.js";
import { createFilePicker, type FilePickerHandle } from "../../../glass/inputs/glass-file.js";
import {
    DEFAULT_ALBEDO_SETTINGS,
    MAX_UPLOAD_TEXTURE_DIM,
} from "../../../../../shared/constants/voxlab/texture-paint-constants.js";
import { snapshotRegistry } from "../../../../../state/voxlab/registries/snapshot-registry.js";
import { downsample } from "../../../../../voxlab/mappers/downsample-mapper.js";
import type {
    AlbedoChange,
    AlbedoSettings,
    AlbedoSource,
} from "../../../../../shared/types/voxlab/paint/paint-types.js";
import { DropdownComponent, type DropdownChangeDetail } from "../../panels/dropdown-component.js";

const CLS_SECTION = "voxlab__footer-section";
const CLS_HEADING = "voxlab__footer-section-heading";
const CLS_BTN_PRIMARY = "voxlab__dropdown-btn-primary";

export class AlbedoSection extends BaseVoxlabComponent {
    private settings: AlbedoSettings = { ...DEFAULT_ALBEDO_SETTINGS };
    private filePicker!: FilePickerHandle;
    private sourceDropdown!: DropdownComponent<AlbedoSource>;

    constructor() {
        super();
        snapshotRegistry.register<AlbedoSettings>({
            name: "albedo",
            getState: () => ({ ...this.settings }),
            applyState: (state, opts) => this.apply(state, opts),
            paths: [],
        });
    }

    get current(): AlbedoSettings {
        return { ...this.settings };
    }

    apply(state: AlbedoSettings, opts?: { silent?: boolean }): void {
        this.settings = { ...state };
        if (this.sourceDropdown) this.sourceDropdown.select(this.settings.source);
        if (!opts?.silent) this.emit<AlbedoChange>("albedo-change", { ...this.settings });
    }

    reset(): void {
        this.apply({ ...DEFAULT_ALBEDO_SETTINGS });
        if (this.filePicker) this.filePicker.clear();
    }

    private buildClearBtn(): Instance<HTMLButtonElement> {
        return button({
            classes: [CLS_BTN_PRIMARY],
            text: "Clear albedo",
            ariaLabel: "Remove albedo, return to vertex colors only",
            onClick: () => {
                this.settings.uploadedDataUrl = null;
                this.settings.source = "none";
                this.sourceDropdown.select("none");
                this.filePicker.clear();
                this.emit<AlbedoChange>("albedo-change", { ...this.settings });
            },
            context: "clear albedo and use vertex colors",
            meta: ["action"],
        });
    }

    private mountSourceDropdown(section: Instance): void {
        this.sourceDropdown = new DropdownComponent<AlbedoSource>(
            [
                { value: "none", label: "Source: None (vertex colors only)" },
                { value: "source-image", label: "Source: Source image" },
                { value: "uploaded", label: "Source: Uploaded" },
            ],
            this.settings.source,
        );
        this.sourceDropdown.mount(section.el);
        this.sourceDropdown.addEventListener("change", (e) => {
            this.settings.source = (e as CustomEvent<DropdownChangeDetail<AlbedoSource>>).detail.value;
            this.emit<AlbedoChange>("albedo-change", { ...this.settings });
        });
    }

    protected build(): HTMLElement {
        this.filePicker = createFilePicker({
            label: "Upload albedo image",
            accept: "image/*",
            ariaLabel: "Upload an image to bind as the mesh albedo map",
        });
        this.filePicker.input.addEventListener("change", () => this.handleUpload());
        const clearBtn = this.buildClearBtn();
        const section = div({ classes: [CLS_SECTION], context: null, meta: null }, [
            heading("h3", { classes: [CLS_HEADING], text: "Albedo", context: null, meta: null }),
        ]);
        this.mountSourceDropdown(section);
        section.addChild(this.filePicker.wrapper);
        section.addChild(clearBtn);
        return section.el;
    }

    private handleUpload(): void {
        const file = this.filePicker.getCurrent();
        if (!file) return;
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            const result = reader.result;
            if (typeof result !== "string") return;
            void downsample(result, MAX_UPLOAD_TEXTURE_DIM).then((capped) => {
                this.settings.uploadedDataUrl = capped;
                this.settings.source = "uploaded";
                this.sourceDropdown.select("uploaded");
                this.emit<AlbedoChange>("albedo-change", { ...this.settings });
            });
        });
        reader.readAsDataURL(file);
    }

    protected onUnmount(): void {
        if (this.sourceDropdown) this.sourceDropdown.unmount();
    }
}
