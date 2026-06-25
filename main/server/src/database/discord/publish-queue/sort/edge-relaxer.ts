import type { GraphState } from "./sort-types.js";

export function relaxChildren(id: string, graph: GraphState, queue: string[]): void {
    for (const child of graph.dependents[id] ?? []) {
        const next = (graph.inDegree[child] ?? 0) - 1;
        graph.inDegree[child] = next;
        if (next === 0) queue.push(child);
    }
}
