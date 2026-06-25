import { heading, section as sectionEl } from "../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../managers/voxlab/base/base-voxlab-component.js";
import { DropdownComponent, type DropdownChangeDetail } from "./dropdown-component.js";
import {
    ANIMATION_FORMATS,
    DEFAULT_FPS,
    DEFAULT_HEIGHT,
    DEFAULT_WIDTH,
    FORMAT_OPTIONS,
    MAX_DIMENSION,
    MAX_FPS,
    MIN_DIMENSION,
    MIN_FPS,
    RADIX_DEC,
    type BakeRequest,
    type CaptureRequest,
    type ExportFormat,
} from "./export-panel-types.js";
import { buildExportButtons, buildExportInputs } from "./export-panel-builders.js";
export type { BakeRequest, CaptureRequest, ExportFormat } from "./export-panel-types.js";

const CLS_PANEL = ["voxlab__sidebar-panel", "voxlab__sidebar-export-panel"];
const CLS_HEADING = "voxlab__sidebar-panel-heading";

export class ExportPanelComponent extends BaseVoxlabComponent {
    private formatDropdown!: DropdownComponent<ExportFormat>;
    private widthInput!: HTMLInputElement;
    private heightInput!: HTMLInputElement;
    private fpsInput!: HTMLInputElement;
    private fpsWrapper!: HTMLElement;
    private captureButton!: HTMLButtonElement;
    private bakeButton!: HTMLButtonElement;
    private actionButtons: HTMLButtonElement[] = [];

    protected build(): HTMLElement {
        const { width, height, fps } = buildExportInputs();
        this.widthInput = width.input;
        this.heightInput = height.input;
        this.fpsInput = fps.input;
        this.fpsWrapper = fps.wrapper;
        const { captureBtn, bakeBtn } = buildExportButtons();
        this.captureButton = captureBtn.el;
        this.bakeButton = bakeBtn.el;
        const section = sectionEl({ classes: CLS_PANEL, context: null, meta: null }, [
            heading("h2", { classes: [CLS_HEADING], text: "Export", context: null, meta: null }),
        ]);
        this.formatDropdown = new DropdownComponent<ExportFormat>(FORMAT_OPTIONS, "png", "voxlab__dropdown--banner");
        this.formatDropdown.mount(section.el);
        section.addChild(width.wrapper);
        section.addChild(height.wrapper);
        section.addChild(fps.wrapper);
        section.addChild(captureBtn);
        section.addChild(bakeBtn);
        this.actionButtons = [this.captureButton, this.bakeButton];
        for (const btn of this.actionButtons) btn.disabled = true;
        this.wireEvents();
        this.applyFormatVisibility(this.formatDropdown.value);
        return section.el;
    }

    setEnabled(enabled: boolean): void {
        for (const btn of this.actionButtons) btn.disabled = !enabled;
        this.applyFormatVisibility(this.formatDropdown.value);
    }

    protected onUnmount(): void {
        this.formatDropdown.unmount();
    }

    private wireEvents(): void {
        this.formatDropdown.addEventListener("change", (e) => {
            const detail = (e as CustomEvent<DropdownChangeDetail<ExportFormat>>).detail;
            this.applyFormatVisibility(detail.value);
        });
        this.captureButton.addEventListener("click", () => this.requestCapture());
        this.bakeButton.addEventListener("click", () => this.requestBake());
    }

    private requestCapture(): void {
        const fmt = this.formatDropdown.value;
        if (fmt !== "png" && fmt !== "webp") return;
        const req: CaptureRequest = {
            format: fmt,
            width: this.readDimension(this.widthInput, DEFAULT_WIDTH),
            height: this.readDimension(this.heightInput, DEFAULT_HEIGHT),
        };
        this.emit<CaptureRequest>("capture-requested", req);
    }

    private requestBake(): void {
        const fmt = this.formatDropdown.value;
        if (!ANIMATION_FORMATS.has(fmt)) return;
        const req: BakeRequest = {
            format: fmt as BakeRequest["format"],
            width: this.readDimension(this.widthInput, DEFAULT_WIDTH),
            height: this.readDimension(this.heightInput, DEFAULT_HEIGHT),
            fps: this.readFps(),
        };
        this.emit<BakeRequest>("bake-requested", req);
    }

    private applyFormatVisibility(format: ExportFormat): void {
        const isAnimation = ANIMATION_FORMATS.has(format);
        this.bakeButton.style.display = isAnimation ? "" : "none";
        this.captureButton.style.display = isAnimation ? "none" : "";
        this.fpsWrapper.style.display = isAnimation ? "" : "none";
    }

    private readDimension(target: HTMLInputElement, fallback: number): number {
        const n = Number.parseInt(target.value, RADIX_DEC);
        if (!Number.isFinite(n) || n < MIN_DIMENSION) return fallback;
        return Math.min(MAX_DIMENSION, n);
    }

    private readFps(): number {
        const n = Number.parseInt(this.fpsInput.value, RADIX_DEC);
        if (!Number.isFinite(n) || n < MIN_FPS) return DEFAULT_FPS;
        return Math.min(MAX_FPS, n);
    }
}
