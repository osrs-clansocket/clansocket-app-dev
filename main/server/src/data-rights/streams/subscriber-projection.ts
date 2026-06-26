import type { DeltaBatch } from "@clansocket/realtime";
import type { ProjectionHandle, ProjectionTopic, TopicState } from "./projection-types.js";
import { addState, removeState } from "./scheduler-projection.js";
import { seedBaseline } from "./seeder-projection.js";

export function defineTopic(spec: ProjectionTopic): ProjectionTopic {
    return spec;
}

export function subscribeProjection(
    topic: string,
    def: ProjectionTopic,
    sink: (batch: DeltaBatch) => void,
): ProjectionHandle {
    const state: TopicState = { topic, def, sink, snapshot: {}, seq: 0 };
    addState(state);
    return {
        baseline: seedBaseline(state),
        unsubscribe(): void {
            removeState(state);
        },
    };
}
