import type { DeltaBatch, SnapshotBaseline } from "@clansocket/realtime";

export interface ProjectionTrigger {
    scopeKey: string;
    table: string;
}

export interface ProjectionTopic {
    triggers: ReadonlyArray<ProjectionTrigger>;
    query(): Record<string, unknown>[];
    keyOf(row: Record<string, unknown>): string;
}

export interface ProjectionHandle {
    baseline: SnapshotBaseline;
    unsubscribe(): void;
}

export interface TopicState {
    topic: string;
    def: ProjectionTopic;
    snapshot: Record<string, string>;
    seq: number;
    sink: (batch: DeltaBatch) => void;
}
