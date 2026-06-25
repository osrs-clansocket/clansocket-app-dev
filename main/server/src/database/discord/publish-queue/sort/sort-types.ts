export interface DependencyEdge {
    change_id: string;
    dependency_change_id: string;
}

export interface GraphState {
    inDegree: Record<string, number>;
    dependents: Record<string, string[]>;
}
