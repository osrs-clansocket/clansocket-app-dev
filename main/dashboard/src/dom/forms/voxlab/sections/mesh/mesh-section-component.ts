import { button, div, heading, type Instance } from "../../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../../managers/voxlab/base/base-voxlab-component.js";
import { createColorInput, createToggleInput } from "../../../../../voxlab/formatters/control-formatter.js";
import {
    pathNumber,
    snapshotRegistry,
    type PathSpec,
} from "../../../../../state/voxlab/registries/snapshot-registry.js";
import { DEFAULT_MESH_SETTINGS } from "../../../../../shared/constants/voxlab/mesh-settings-constants.js";
import type { MeshSettings } from "../../../../../shared/types/voxlab/mesh/mesh-settings-types.js";
import { buildMeshSliders } from "./mesh-section-sliders.js";
import { wireMeshInputs, type MeshInputRefs } from "./mesh-section-wiring.js";

const CLS_SECTION = "voxlab__footer-section";
const CLS_HEADING = "voxlab__footer-section-heading";
const CLS_BTN_PRIMARY = "voxlab__dropdown-btn-primary";

const MESH_PATHS: ReadonlyArray<PathSpec> = [pathNumber("scale", "scale")];

export class MeshSectionComponent extends BaseVoxlabComponent {
    private settings: MeshSettings = { ...DEFAULT_MESH_SETTINGS };
    private inputs: MeshInputRefs | null = null;

    constructor() {
        super();
        snapshotRegistry.register<MeshSettings>({
            name: "mesh",
            getState: () => this.current,
            applyState: (state, opts) => this.apply(state, opts),
            paths: MESH_PATHS,
        });
    }

    get current(): MeshSettings {
        return { ...this.settings };
    }

    apply(state: MeshSettings, opts?: { silent?: boolean }): void {
        this.settings = { ...state };
        if (this.inputs !== null) {
            this.inputs.smoothingRounds.value = String(this.settings.smoothingRounds);
            this.inputs.cornerAngle.value = String(this.settings.cornerAngleDegrees);
            this.inputs.scale.value = String(this.settings.scale);
            this.inputs.normalize.checked = this.settings.normalize;
            this.inputs.vertexColor.value = this.settings.vertexColor;
            this.inputs.taubinLambda.value = String(this.settings.taubinLambda);
            this.inputs.taubinMu.value = String(this.settings.taubinMu);
        }
        if (!opts?.silent) this.emit<MeshSettings>("mesh-change", this.current);
    }

    reset(): void {
        this.apply({ ...DEFAULT_MESH_SETTINGS });
    }

    private buildReloadBtn(): Instance<HTMLButtonElement> {
        return button({
            classes: [CLS_BTN_PRIMARY],
            text: "Reload from source",
            onClick: () => this.emit<null>("mesh-reload", null),
            context: "reload mesh from source",
            meta: ["action"],
        });
    }

    private buildInputRefs(
        s: ReturnType<typeof buildMeshSliders>,
        normalize: ReturnType<typeof createToggleInput>,
        vertexColor: ReturnType<typeof createColorInput>,
    ): MeshInputRefs {
        return {
            smoothingRounds: s.smoothingRounds.input,
            cornerAngle: s.cornerAngle.input,
            scale: s.scale.input,
            normalize: normalize.input,
            vertexColor: vertexColor.input,
            taubinLambda: s.taubinLambda.input,
            taubinMu: s.taubinMu.input,
        };
    }

    private buildSectionChildren(
        reloadBtn: Instance,
        s: ReturnType<typeof buildMeshSliders>,
        normalize: ReturnType<typeof createToggleInput>,
        vertexColor: ReturnType<typeof createColorInput>,
    ): Array<Instance | HTMLElement> {
        return [
            heading("h3", { classes: [CLS_HEADING], text: "Mesh", context: null, meta: null }),
            reloadBtn,
            s.smoothingRounds.wrapper,
            s.cornerAngle.wrapper,
            s.scale.wrapper,
            normalize.wrapper,
            vertexColor.wrapper,
            s.taubinLambda.wrapper,
            s.taubinMu.wrapper,
        ];
    }

    protected build(): HTMLElement {
        const reloadBtn = this.buildReloadBtn();
        const s = buildMeshSliders();
        const normalize = createToggleInput({
            label: "Normalize to unit cube",
            checked: DEFAULT_MESH_SETTINGS.normalize,
        });
        const vertexColor = createColorInput({ label: "Vertex tint", value: DEFAULT_MESH_SETTINGS.vertexColor });
        const section = div(
            { classes: [CLS_SECTION], context: null, meta: null },
            this.buildSectionChildren(reloadBtn, s, normalize, vertexColor),
        );
        this.inputs = this.buildInputRefs(s, normalize, vertexColor);
        wireMeshInputs(
            this.inputs,
            this.settings,
            () => this.emit<MeshSettings>("mesh-change", this.current),
            () => this.emit<MeshSettings>("mesh-bake-change", this.current),
        );
        return section.el;
    }
}
