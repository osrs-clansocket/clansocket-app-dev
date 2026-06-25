import type { LifecycleHandles } from "./viewport-manager-lifecycle.js";
import type { GridAxesOverlay } from "./grid-axes-overlay.js";

export abstract class ViewportGridMixin extends EventTarget {
    protected abstract readonly helpers: GridAxesOverlay;
    protected abstract readonly handles: LifecycleHandles;

    setAidsVisible(v: boolean): void {
        this.helpers.setVisible(v);
        this.handles.needsRender.v = true;
    }
    setGridColor(c: number | string): void {
        this.helpers.setGridColor(c);
    }
    setFloorY(y: number): void {
        this.helpers.setFloorY(y);
    }
    setGridSize(s: number): void {
        this.helpers.setGridSize(s);
    }
    setGridDivisions(d: number): void {
        this.helpers.setGridDivisions(d);
    }
    setAxesLength(l: number): void {
        this.helpers.setAxesLength(l);
    }
}
