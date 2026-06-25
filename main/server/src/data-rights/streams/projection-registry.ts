import type { ProjectionTopic } from "./projection.js";

export type TopicBuilder = (siteAccountId: string, query: Record<string, unknown>) => ProjectionTopic | null;

const builders = new Map<string, TopicBuilder>();

export function registerTopic(name: string, builder: TopicBuilder): void {
    builders.set(name, builder);
}

export function resolveTopic(
    name: string,
    siteAccountId: string,
    query: Record<string, unknown>,
): ProjectionTopic | null {
    const builder = builders.get(name);
    return builder ? builder(siteAccountId, query) : null;
}
