import type { MeshPart, PartsPaintState } from "../../../shared/types/voxlab/paint/paint-types.js";
import type { RgbTuple, StrokeDelta, VertexRange } from "../paint/paint-manager-types.js";

export interface HistoryState {
    strokeHistory: StrokeDelta[];
    redoStack: StrokeDelta[];
    partsState: PartsPaintState;
    overridesMap: Map<number, RgbTuple>;
    rangeOf: (part: MeshPart) => VertexRange | null;
}
