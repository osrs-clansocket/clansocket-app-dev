import { button, div, heading, type Instance } from "../../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../../managers/voxlab/base/base-voxlab-component.js";
import { DEFAULT_BRUSH_STATE } from "../../../../../shared/constants/voxlab/texture-paint-constants.js";
import { snapshotRegistry } from "../../../../../state/voxlab/registries/snapshot-registry.js";
import type {
    BrushChange,
    BrushMode,
    BrushState,
    PaintClearAll,
} from "../../../../../shared/types/voxlab/paint/paint-types.js";
import type { DropdownComponent } from "../../panels/dropdown-component.js";
import { buildBrushControl, buildColorPicker, buildModeControl } from "./paint-section-controls.js";
import { buildPaintToggles } from "./paint-section-toggles.js";
import { BRUSH_PATHS } from "./paint-section-paths.js";

const CLS_SECTION = "voxlab__footer-section";
const CLS_HEADING = "voxlab__footer-section-heading";
const CLS_BUTTON_ROW = "voxlab__dropdown-button-row";

interface PaintInputs {
    color: HTMLInputElement;
    radius: HTMLInputElement;
    falloffSigma: HTMLInputElement;
    opacity: HTMLInputElement;
    paintMode: HTMLInputElement;
    eyedropper: HTMLInputElement;
    mirrorX: HTMLInputElement;
    mirrorY: HTMLInputElement;
    mirrorZ: HTMLInputElement;
    hideBackFaces: HTMLInputElement;
}

export class PaintSection extends BaseVoxlabComponent {
    private settings: BrushState = { ...DEFAULT_BRUSH_STATE };
    private inputs!: PaintInputs;
    private modeDropdown!: DropdownComponent<BrushMode>;

    constructor() {
        super();
        snapshotRegistry.register<BrushState>({
            name: "brush",
            getState: () => this.current,
            applyState: (state, opts) => this.apply(state, opts),
            paths: BRUSH_PATHS,
        });
    }

    get current(): BrushState {
        return { ...this.settings };
    }

    apply(state: BrushState, opts?: { silent?: boolean }): void {
        this.settings = { ...state };
        if (this.inputs) {
            this.inputs.color.value = this.settings.color;
            this.inputs.radius.value = String(this.settings.radius);
            this.inputs.falloffSigma.value = String(this.settings.falloffSigma);
            this.inputs.opacity.value = String(this.settings.opacity);
            this.inputs.paintMode.checked = this.settings.paintMode;
            this.inputs.eyedropper.checked = this.settings.eyedropper;
            this.inputs.mirrorX.checked = this.settings.mirrorX;
            this.inputs.mirrorY.checked = this.settings.mirrorY;
            this.inputs.mirrorZ.checked = this.settings.mirrorZ;
            this.inputs.hideBackFaces.checked = this.settings.hideBackFaces;
        }
        if (this.modeDropdown) this.modeDropdown.select(this.settings.mode);
        if (!opts?.silent) this.emitChange();
    }

    reset(): void {
        this.apply({ ...DEFAULT_BRUSH_STATE });
    }

    private buildPaintRow(): Instance {
        const clearBtn = button({
            ariaLabel: "Clear all painted vertices, restore baseline",
            text: "Clear all paint",
            onClick: () => this.emit<PaintClearAll>("paint-clear-all", { timestamp: Date.now() }),
            context: "clear all painted vertices",
            meta: ["action", "destructive"],
        });
        const exportBtn = button({
            ariaLabel: "Download current mesh with paint baked into vertex colors as JSON",
            text: "Export painted mesh",
            onClick: () => this.emit<{ timestamp: number }>("paint-export", { timestamp: Date.now() }),
            context: "export painted mesh as JSON",
            meta: ["action"],
        });
        return div({ classes: [CLS_BUTTON_ROW], context: null, meta: null }, [clearBtn, exportBtn]);
    }

    private collectInputRefs(
        colorPicker: ReturnType<typeof buildColorPicker>,
        sliders: ReturnType<typeof buildBrushControl>,
        toggles: ReturnType<typeof buildPaintToggles>,
    ): PaintInputs {
        return {
            color: colorPicker.input,
            radius: sliders.radius.input,
            falloffSigma: sliders.falloff.input,
            opacity: sliders.opacity.input,
            paintMode: toggles.paintMode.input,
            eyedropper: toggles.eyedropper.input,
            mirrorX: toggles.mirrorX.input,
            mirrorY: toggles.mirrorY.input,
            mirrorZ: toggles.mirrorZ.input,
            hideBackFaces: toggles.hideBackFaces.input,
        };
    }

    protected build(): HTMLElement {
        const onChange = (): void => this.emitChange();
        const colorPicker = buildColorPicker(this.settings, onChange);
        const sliders = buildBrushControl(this.settings, onChange);
        this.modeDropdown = buildModeControl(this.settings, onChange);
        const toggles = buildPaintToggles(this.settings, onChange);
        const section = div({ classes: [CLS_SECTION], context: null, meta: null }, [
            heading("h3", { classes: [CLS_HEADING], text: "Paint", context: null, meta: null }),
            colorPicker.wrapper,
            sliders.radius.wrapper,
            sliders.falloff.wrapper,
            sliders.opacity.wrapper,
            toggles.paintMode.wrapper,
            toggles.eyedropper.wrapper,
            toggles.mirrorX.wrapper,
            toggles.mirrorY.wrapper,
            toggles.mirrorZ.wrapper,
            toggles.hideBackFaces.wrapper,
            this.buildPaintRow(),
        ]);
        this.modeDropdown.mount(section.el);
        this.inputs = this.collectInputRefs(colorPicker, sliders, toggles);
        return section.el;
    }

    protected onUnmount(): void {
        if (this.modeDropdown) this.modeDropdown.unmount();
    }

    private emitChange(): void {
        this.emit<BrushChange>("brush-change", { ...this.settings });
    }
}
