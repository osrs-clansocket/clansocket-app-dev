import { lookupOperation, lookupTrigger } from "../../flows/registries/capability-registry.js";
import type { FlowDefinition, FlowNode } from "../../flows/store/flow-definition-types.js";

export type InScopeKind = "event" | "entity" | "variable" | "tracker" | "operation-output";

export interface InScopeSource {
    readonly kind: InScopeKind;
    readonly path: string;
    readonly label: string;
    readonly group: string;
}

export function walkScopeFor(flow: FlowDefinition, fromNodeId: string): readonly InScopeSource[] {
    const ancestors = collectAncestors(flow, fromNodeId);
    const sources: InScopeSource[] = [];
    appendEventScope(flow, sources);
    appendEntityScope(sources);
    appendAncestorScope(flow, ancestors, sources);
    return sources;
}

function collectAncestors(flow: FlowDefinition, fromNodeId: string): Set<string> {
    const ancestors = new Set<string>();
    const frontier: string[] = [fromNodeId];
    while (frontier.length > 0) {
        const current = frontier.pop()!;
        for (const edge of flow.edges) {
            if (edge.to_node_id !== current) continue;
            if (ancestors.has(edge.from_node_id)) continue;
            ancestors.add(edge.from_node_id);
            frontier.push(edge.from_node_id);
        }
    }
    return ancestors;
}

function appendEventScope(flow: FlowDefinition, sources: InScopeSource[]): void {
    if (flow.trigger_type !== "event") return;
    const eventSource = flow.trigger_config.event_source;
    if (!eventSource) return;
    const triggerSpec = lookupTrigger(eventSource);
    if (!triggerSpec) return;
    const paths = collectSchemaPaths(triggerSpec.payload_schema, "");
    for (const path of paths) {
        sources.push({
            kind: "event",
            path: `event.${path}`,
            label: path,
            group: "Trigger event",
        });
    }
}

function appendEntityScope(sources: InScopeSource[]): void {
    const entityPaths = [
        "rsn",
        "account.type",
        "skills.total_level",
        "clan.rank",
        "clan.tenure_days",
        "recent.days_inactive",
    ];
    for (const path of entityPaths) {
        sources.push({
            kind: "entity",
            path: `entity.${path}`,
            label: path,
            group: "Entity",
        });
    }
}

function appendAncestorScope(flow: FlowDefinition, ancestors: Set<string>, sources: InScopeSource[]): void {
    for (const node of flow.nodes) {
        if (!ancestors.has(node.id)) continue;
        if (node.kind === "variable") appendVariableScope(node, sources);
        if (node.kind === "tracker") appendTrackerScope(node, sources);
        if (node.kind === "action") appendActionOutputScope(node, sources);
    }
}

function appendVariableScope(node: FlowNode, sources: InScopeSource[]): void {
    const name = typeof node.config.name === "string" ? node.config.name : node.id;
    sources.push({
        kind: "variable",
        path: `variables.${name}`,
        label: name,
        group: "Variables",
    });
}

function appendTrackerScope(node: FlowNode, sources: InScopeSource[]): void {
    const key = typeof node.config.key === "string" ? node.config.key : node.id;
    sources.push({
        kind: "tracker",
        path: `trackers.${key}`,
        label: key,
        group: "Trackers",
    });
}

function appendActionOutputScope(node: FlowNode, sources: InScopeSource[]): void {
    if (!node.operation_ref) return;
    const opSpec = lookupOperation(node.operation_ref);
    if (!opSpec) return;
    const paths = collectSchemaPaths(opSpec.output_schema, "");
    for (const path of paths) {
        sources.push({
            kind: "operation-output",
            path: `variables.${node.id}.${path}`,
            label: `${node.id}.${path}`,
            group: `Output: ${node.id}`,
        });
    }
}

function collectSchemaPaths(schema: Readonly<Record<string, unknown>>, prefix: string): readonly string[] {
    const result: string[] = [];
    const properties = schema.properties;
    if (!properties || typeof properties !== "object") return result;
    for (const [name, propSchema] of Object.entries(properties as Record<string, Readonly<Record<string, unknown>>>)) {
        const path = prefix.length === 0 ? name : `${prefix}.${name}`;
        result.push(path);
        if (propSchema.type === "object") {
            for (const child of collectSchemaPaths(propSchema, path)) result.push(child);
        }
    }
    return result;
}
