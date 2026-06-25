import { button, div, heading, type Instance } from "../../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../../managers/voxlab/base/base-voxlab-component.js";
import { DEFAULT_GRADIENT_SPEC } from "../../../../../shared/constants/voxlab/texture-paint-constants.js";
import { snapshotRegistry } from "../../../../../state/voxlab/registries/snapshot-registry.js";
import type {
    GradientApply,
    GradientAxis,
    GradientSpec,
    GradientTarget,
    GradientType,
} from "../../../../../shared/types/voxlab/paint/paint-types.js";
import type { DropdownComponent } from "../../panels/dropdown-component.js";
import { buildGradientDropdowns } from "./gradient-section-dropdowns.js";
import { buildStopRow, cloneSpec } from "./gradient-section-stops.js";

const CLS_SECTION = "voxlab__footer-section";
const CLS_HEADING = "voxlab__footer-section-heading";
const CLS_BTN_PRIMARY = "voxlab__dropdown-btn-primary";

const MIDPOINT_POSITION = 0.5;
const NEW_STOP_COLOR = "#888888";

export class GradientSection extends BaseVoxlabComponent {
    private settings: GradientSpec = cloneSpec(DEFAULT_GRADIENT_SPEC);
    private stopsHost: Instance | null = null;
    private typeDropdown!: DropdownComponent<GradientType>;
    private axisDropdown!: DropdownComponent<GradientAxis>;
    private targetDropdown!: DropdownComponent<GradientTarget>;

    constructor() {
        super();
        snapshotRegistry.register<GradientSpec>({
            name: "gradient",
            getState: () => cloneSpec(this.settings),
            applyState: (state) => {
                this.settings = cloneSpec(state);
                this.rebuildStops();
                if (this.typeDropdown) this.typeDropdown.select(this.settings.type);
                if (this.axisDropdown) this.axisDropdown.select(this.settings.axis);
                if (this.targetDropdown) this.targetDropdown.select(this.settings.target);
            },
            paths: [],
        });
    }

    get current(): GradientSpec {
        return cloneSpec(this.settings);
    }

    reset(): void {
        this.settings = cloneSpec(DEFAULT_GRADIENT_SPEC);
        this.rebuildStops();
        if (this.typeDropdown) this.typeDropdown.select(this.settings.type);
        if (this.axisDropdown) this.axisDropdown.select(this.settings.axis);
        if (this.targetDropdown) this.targetDropdown.select(this.settings.target);
    }

    private buildAddBtn(): Instance<HTMLButtonElement> {
        return button({
            classes: [CLS_BTN_PRIMARY],
            text: "Add stop",
            ariaLabel: "Add a new gradient color stop at midpoint",
            onClick: () => {
                this.settings.stops.push({ color: NEW_STOP_COLOR, position: MIDPOINT_POSITION });
                this.rebuildStops();
                this.emitChange();
            },
            context: "add gradient color stop",
            meta: ["action"],
        });
    }

    private buildApplyBtn(): Instance<HTMLButtonElement> {
        return button({
            classes: [CLS_BTN_PRIMARY],
            text: "Apply gradient",
            ariaLabel: "Apply current gradient to target vertices",
            onClick: () => this.emit<GradientApply>("gradient-apply", cloneSpec(this.settings)),
            context: "apply gradient to mesh vertices",
            meta: ["action"],
        });
    }

    protected build(): HTMLElement {
        this.stopsHost = div({ context: null, meta: null });
        const addStopBtn = this.buildAddBtn();
        const { typeDropdown, axisDropdown, targetDropdown } = buildGradientDropdowns(this.settings, () =>
            this.emitChange(),
        );
        this.typeDropdown = typeDropdown;
        this.axisDropdown = axisDropdown;
        this.targetDropdown = targetDropdown;
        const applyBtn = this.buildApplyBtn();
        const section = div({ classes: [CLS_SECTION], context: null, meta: null }, [
            heading("h3", { classes: [CLS_HEADING], text: "Gradient", context: null, meta: null }),
            this.stopsHost,
            addStopBtn,
        ]);
        this.typeDropdown.mount(section.el);
        this.axisDropdown.mount(section.el);
        this.targetDropdown.mount(section.el);
        section.addChild(applyBtn);
        this.rebuildStops();
        return section.el;
    }

    protected onUnmount(): void {
        if (this.typeDropdown) this.typeDropdown.unmount();
        if (this.axisDropdown) this.axisDropdown.unmount();
        if (this.targetDropdown) this.targetDropdown.unmount();
    }

    private emitChange(): void {
        this.emit<GradientSpec>("gradient-change", cloneSpec(this.settings));
    }

    private rebuildStops(): void {
        if (!this.stopsHost) return;
        const rows: Instance[] = [];
        for (let i = 0; i < this.settings.stops.length; i++) {
            rows.push(
                buildStopRow({
                    settings: this.settings,
                    index: i,
                    onEmit: () => this.emitChange(),
                    onRemove: () => {
                        this.settings.stops.splice(i, 1);
                        this.rebuildStops();
                        this.emitChange();
                    },
                }),
            );
        }
        this.stopsHost.setChildren(...rows);
    }
}
