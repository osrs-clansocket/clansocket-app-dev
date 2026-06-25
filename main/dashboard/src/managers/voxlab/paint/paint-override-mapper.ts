import type { PaintOverride } from "../../../shared/types/voxlab/paint/paint-types.js";
import type { RgbTuple } from "./paint-stroke-types.js";

export function mapFromOverrides(overrides: ReadonlyArray<PaintOverride>): Map<number, RgbTuple> {
    const out = new Map<number, RgbTuple>();
    for (const o of overrides) {
        out.set(o.vertexIndex, [o.rgb[0], o.rgb[1], o.rgb[2]]);
    }
    return out;
}
