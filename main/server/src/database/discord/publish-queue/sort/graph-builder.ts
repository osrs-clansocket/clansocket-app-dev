import type { DependencyEdge, GraphState } from "./sort-types.js";

export function buildGraph(changeIds: string[], deps: DependencyEdge[]): GraphState {
    const ids = new Set(changeIds);
    const inDegree: Record<string, number> = {};
    const dependents: Record<string, string[]> = {};
    for (const id of changeIds) {
        inDegree[id] = 0;
        dependents[id] = [];
    }
    for (const dep of deps) {
        if (!ids.has(dep.change_id) || !ids.has(dep.dependency_change_id)) continue;
        inDegree[dep.change_id] = (inDegree[dep.change_id] ?? 0) + 1;
        dependents[dep.dependency_change_id]!.push(dep.change_id);
    }
    return { inDegree, dependents };
}
