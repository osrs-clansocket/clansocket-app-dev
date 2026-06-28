import type { FlowCardPlacement } from "../../dom/pages/clans/manage/flow-builder/flow-card-types.js";
import { outputHandlesFor } from "./node-handles.js";
import type { SerializedEdge } from "./serializer-types.js";

export function placementAt(
    placements: readonly FlowCardPlacement[],
    row: number,
    col: number,
): FlowCardPlacement | null {
    return placements.find((p) => p.row === row && p.col === col) ?? null;
}

function edgeFor(
    from: FlowCardPlacement,
    to: FlowCardPlacement,
    handleId: string,
    separator: string,
): SerializedEdge {
    return {
        id: `${from.config.id}${separator}${to.config.id}`,
        from_node_id: from.config.id,
        from_handle_id: handleId,
        to_node_id: to.config.id,
    };
}

export function deriveEdges(placements: readonly FlowCardPlacement[]): readonly SerializedEdge[] {
    const edges: SerializedEdge[] = [];
    for (const p of placements) {
        const handles = outputHandlesFor(p.config);
        const defaultHandle = handles[0]?.id ?? "next";
        const right = placementAt(placements, p.row, p.col + 1);
        if (right) edges.push(edgeFor(p, right, defaultHandle, "->"));
        const below = placementAt(placements, p.row + 1, p.col);
        if (below) {
            const handleForBelow = handles.length > 1 ? handles[1]!.id : defaultHandle;
            edges.push(edgeFor(p, below, handleForBelow, ">"));
        }
    }
    return edges;
}
