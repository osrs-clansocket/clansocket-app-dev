import { chartRegistry } from "./registry";
import type { AnySpec } from "./factory-types.js";

export function unmount(canvas: HTMLCanvasElement): void {
    chartRegistry.destroy(canvas);
}

export function update(canvas: HTMLCanvasElement, next: AnySpec): void {
    const m = chartRegistry.get(canvas);
    if (m) m.update(next);
}
