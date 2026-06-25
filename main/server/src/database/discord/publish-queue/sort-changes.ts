import { CyclicDependencyError } from "./sort/cyclic-dependency-error.js";
import { buildGraph } from "./sort/graph-builder.js";
import { relaxChildren } from "./sort/edge-relaxer.js";
import { findRoots } from "./sort/root-finder.js";
import type { DependencyEdge } from "./sort/sort-types.js";

export type { DependencyEdge } from "./sort/sort-types.js";
export { CyclicDependencyError } from "./sort/cyclic-dependency-error.js";

export function sortChangesDeps(changeIds: string[], deps: DependencyEdge[]): string[] {
    const graph = buildGraph(changeIds, deps);
    const queue = findRoots(graph.inDegree);
    const result: string[] = [];
    while (queue.length > 0) {
        const id = queue.shift()!;
        result.push(id);
        relaxChildren(id, graph, queue);
    }
    if (result.length !== changeIds.length) throw new CyclicDependencyError();
    return result;
}
