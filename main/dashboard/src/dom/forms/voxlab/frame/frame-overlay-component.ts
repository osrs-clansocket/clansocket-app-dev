import { div } from "../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../managers/voxlab/base/base-voxlab-component.js";
import { FRAME_OVERLAY_CLASS } from "../../../../shared/constants/voxlab/voxlab-classes-constants.js";

const PCT = 100;
const DIM_SHADOW = "0 0 0 100vmax rgb(from var(--base-graphite-900) r g b / 0.55)";

export class FrameOverlayComponent extends BaseVoxlabComponent {
    private frameAspect = 1;
    private observer?: ResizeObserver;

    protected build(): HTMLElement {
        const frame = div({ classes: [FRAME_OVERLAY_CLASS], context: null, meta: null });
        frame.el.style.boxShadow = DIM_SHADOW;
        return frame.el;
    }

    setFrameAspect(aspect: number): void {
        this.frameAspect = aspect > 0 ? aspect : 1;
        this.recompute();
    }

    protected onMount(): void {
        const stage = this.element.parentElement;
        if (!stage) return;
        this.observer = new ResizeObserver(() => this.recompute());
        this.observer.observe(stage);
        this.recompute();
    }

    protected onUnmount(): void {
        this.observer?.disconnect();
    }

    private recompute(): void {
        const stage = this.element.parentElement;
        if (!stage) return;
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        if (w === 0 || h === 0) return;
        const pillarbox = this.frameAspect <= w / h;
        const fw = pillarbox ? h * this.frameAspect : w;
        const fh = pillarbox ? h : w / this.frameAspect;
        const style = this.element.style;
        style.insetInlineStart = `${((w - fw) / 2 / w) * PCT}%`;
        style.insetBlockStart = `${((h - fh) / 2 / h) * PCT}%`;
        style.inlineSize = `${(fw / w) * PCT}%`;
        style.blockSize = `${(fh / h) * PCT}%`;
    }
}
