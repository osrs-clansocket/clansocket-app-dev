import { button, div, input, type Instance } from "../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../managers/voxlab/base/base-voxlab-component.js";
import type { LightingManager } from "../../../../managers/voxlab/lighting/lighting-manager.js";
import { modalService } from "../../../../managers/voxlab/services/modal-service.js";

const CLS_GROUP_TITLE = "voxlab-panel__title";
const CLS_BTN = "voxlab-panel__row-btn";
const CLS_STATUS = "voxlab__actions-empty";

const STYLE_HDR_SECTION =
    "padding: 0.45rem 0.6rem; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.15rem;";
const STYLE_HDR_ROW = "display: grid; grid-template-columns: 1fr 1fr; gap: 0;";
const STYLE_BORDER_NONE = "border-right: 0";
const STYLE_STATUS = "padding: 0.3rem 0; text-align: left;";
const STYLE_LIGHTS_TITLE = "padding: 0.45rem 0.6rem";

export interface LightPanelDeps {
    lighting: LightingManager;
    onHdrChanged: () => void;
    sections: ReadonlyArray<BaseVoxlabComponent>;
}

export class LightPanelComponent extends BaseVoxlabComponent {
    private hdrStatus!: Instance;

    constructor(private readonly deps: LightPanelDeps) {
        super();
    }

    private buildHdrRow(): Instance {
        const uploadBtn = button({
            classes: [CLS_BTN],
            text: "Upload .hdr",
            style: STYLE_BORDER_NONE,
            onClick: () => this.uploadHdr(),
            context: "upload .hdr environment map",
            meta: ["action"],
        });
        const clearBtn = button({
            classes: [CLS_BTN],
            text: "Use procedural",
            onClick: () => {
                this.deps.lighting.clearHdr();
                this.deps.onHdrChanged();
                this.refreshHdrStatus();
            },
            context: "clear .hdr and use procedural environment",
            meta: ["action"],
        });
        return div({ style: STYLE_HDR_ROW, context: null, meta: null }, [uploadBtn, clearBtn]);
    }

    protected build(): HTMLElement {
        const hdrRow = this.buildHdrRow();
        this.hdrStatus = div({ classes: [CLS_STATUS], style: STYLE_STATUS, context: null, meta: null });
        const hdrSection = div({ style: STYLE_HDR_SECTION, context: null, meta: null }, [
            div({ classes: [CLS_GROUP_TITLE], text: "Environment HDR", context: null, meta: null }),
            hdrRow,
            this.hdrStatus,
        ]);
        const panel = div({ context: null, meta: null }, [
            hdrSection,
            div({ classes: [CLS_GROUP_TITLE], text: "Lighting", style: STYLE_LIGHTS_TITLE, context: null, meta: null }),
        ]);
        this.refreshHdrStatus();
        for (const section of this.deps.sections) {
            section.mount(panel.el);
        }

        return panel.el;
    }

    refreshHdrStatus(): void {
        if (!this.hdrStatus) return;
        const name = this.deps.lighting.hdrName;
        this.hdrStatus.setText(name ? `HDR: ${name}` : "HDR: procedural env");
    }

    private uploadHdr(): void {
        const picker = input({
            type: "file",
            accept: ".hdr,image/vnd.radiance,application/octet-stream",
            ariaLabel: "pick .hdr environment map file",
            onChange: () => void this.consumeHdrFile(picker.el),
            context: "pick .hdr file to upload",
            meta: ["input"],
        });
        picker.el.click();
    }

    private async consumeHdrFile(picker: HTMLInputElement): Promise<void> {
        const file = picker.files?.[0];
        if (!file) return;
        try {
            const buffer = await file.arrayBuffer();
            await this.deps.lighting.loadHdr(buffer, file.name);
            this.deps.onHdrChanged();
            this.refreshHdrStatus();
        } catch (err) {
            await modalService.alert(`Could not load HDR: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    protected onUnmount(): void {
        for (const section of this.deps.sections) {
            section.unmount();
        }
    }
}
