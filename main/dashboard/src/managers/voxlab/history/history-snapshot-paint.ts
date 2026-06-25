import type {
    PaintOverride,
    PaintSnapshotState,
    PartsPaintState,
} from "../../../shared/types/voxlab/paint/paint-types.js";
import type { RgbTuple } from "../paint/paint-manager-types.js";

export function snapshotPaintState(
    partsState: PartsPaintState,
    overridesMap: Map<number, RgbTuple>,
): PaintSnapshotState {
    const overrides: PaintOverride[] = [];
    for (const [vertexIndex, rgb] of overridesMap) overrides.push({ vertexIndex, rgb: [rgb[0], rgb[1], rgb[2]] });
    return { parts: { ...partsState }, overrides };
}
