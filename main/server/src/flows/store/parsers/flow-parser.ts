import { parseFilter } from "../../../filter/parsers/dsl-parser.js";
import type { FilterAst } from "../../../filter/dsl-types.js";
import {
    INPUT_POLICIES,
    NODE_KINDS,
    NODE_STATUSES,
    TRIGGER_TYPES,
    type FlowDefinition,
    type FlowEdge,
    type FlowNode,
    type FlowOutputHandle,
    type FlowTriggerConfig,
    type InputPolicy,
    type NodeKind,
    type NodeStatus,
    type TriggerType,
} from "../flow-definition-types.js";

export class FlowParseError extends Error {
    public readonly path: string;
    constructor(path: string, message: string) {
        super(`flow ${path}: ${message}`);
        this.name = "FlowParseError";
        this.path = path;
    }
}

const NODE_KIND_SET = new Set<string>(NODE_KINDS);
const INPUT_POLICY_SET = new Set<string>(INPUT_POLICIES);
const TRIGGER_TYPE_SET = new Set<string>(TRIGGER_TYPES);
const NODE_STATUS_SET = new Set<string>(NODE_STATUSES);

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, path: string, key: string): string {
    const got = (value as Record<string, unknown>)[key];
    if (typeof got !== "string" || got.length === 0) {
        throw new FlowParseError(path, `missing required string "${key}"`);
    }
    return got;
}

function requireInteger(value: unknown, path: string, key: string): number {
    const got = (value as Record<string, unknown>)[key];
    if (typeof got !== "number" || !Number.isInteger(got)) {
        throw new FlowParseError(path, `missing required integer "${key}"`);
    }
    return got;
}

function optionalFilter(value: unknown, path: string): FilterAst | undefined {
    if (value === undefined) return undefined;
    try {
        return parseFilter(value);
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new FlowParseError(path, `invalid filter: ${msg}`);
    }
}

function parseOutputHandle(raw: unknown, path: string): FlowOutputHandle {
    if (!isObject(raw)) throw new FlowParseError(path, "expected object");
    const id = requireString(raw, path, "id");
    const label = requireString(raw, path, "label");
    return {
        id,
        label,
        filter: optionalFilter(raw.filter, `${path}.filter`),
        result_class: typeof raw.result_class === "string" ? raw.result_class : undefined,
    };
}

function parseNode(raw: unknown, path: string): FlowNode {
    if (!isObject(raw)) throw new FlowParseError(path, "expected object");
    const kind = requireString(raw, path, "kind");
    if (!NODE_KIND_SET.has(kind)) throw new FlowParseError(path, `unknown kind "${kind}"`);
    const inputPolicy = requireString(raw, path, "input_policy");
    if (!INPUT_POLICY_SET.has(inputPolicy)) {
        throw new FlowParseError(path, `unknown input_policy "${inputPolicy}"`);
    }
    if (!isObject(raw.config)) throw new FlowParseError(path, "config must be object");
    if (!Array.isArray(raw.output_handles)) throw new FlowParseError(path, "output_handles must be array");
    const statusRaw = raw.status;
    const status: NodeStatus | undefined =
        typeof statusRaw === "string" && NODE_STATUS_SET.has(statusRaw) ? (statusRaw as NodeStatus) : undefined;
    return {
        id: requireString(raw, path, "id"),
        kind: kind as NodeKind,
        operation_ref: typeof raw.operation_ref === "string" ? raw.operation_ref : undefined,
        config: raw.config,
        row: requireInteger(raw, path, "row"),
        col: requireInteger(raw, path, "col"),
        row_span: requireInteger(raw, path, "row_span"),
        col_span: requireInteger(raw, path, "col_span"),
        input_policy: inputPolicy as InputPolicy,
        output_handles: raw.output_handles.map((h, i) => parseOutputHandle(h, `${path}.output_handles[${i}]`)),
        status,
    };
}

function parseEdge(raw: unknown, path: string): FlowEdge {
    if (!isObject(raw)) throw new FlowParseError(path, "expected object");
    return {
        id: requireString(raw, path, "id"),
        from_node_id: requireString(raw, path, "from_node_id"),
        from_handle_id: requireString(raw, path, "from_handle_id"),
        to_node_id: requireString(raw, path, "to_node_id"),
    };
}

function parseTriggerConfig(raw: unknown, path: string): FlowTriggerConfig {
    if (!isObject(raw)) throw new FlowParseError(path, "expected object");
    return {
        event_source: typeof raw.event_source === "string" ? raw.event_source : undefined,
        trigger_filter: optionalFilter(raw.trigger_filter, `${path}.trigger_filter`),
        schedule_cron: typeof raw.schedule_cron === "string" ? raw.schedule_cron : undefined,
        loop_interval_ms: typeof raw.loop_interval_ms === "number" ? raw.loop_interval_ms : undefined,
    };
}

export function parseFlowDefinition(raw: unknown): FlowDefinition {
    if (!isObject(raw)) throw new FlowParseError("$", "expected object");
    const triggerType = requireString(raw, "$", "trigger_type");
    if (!TRIGGER_TYPE_SET.has(triggerType)) {
        throw new FlowParseError("$", `unknown trigger_type "${triggerType}"`);
    }
    if (!Array.isArray(raw.nodes)) throw new FlowParseError("$.nodes", "expected array");
    if (!Array.isArray(raw.edges)) throw new FlowParseError("$.edges", "expected array");
    return {
        trigger_type: triggerType as TriggerType,
        trigger_config: parseTriggerConfig(raw.trigger_config, "$.trigger_config"),
        profile_filter: optionalFilter(raw.profile_filter, "$.profile_filter"),
        entry_node_id: requireString(raw, "$", "entry_node_id"),
        nodes: raw.nodes.map((n, i) => parseNode(n, `$.nodes[${i}]`)),
        edges: raw.edges.map((e, i) => parseEdge(e, `$.edges[${i}]`)),
        backpopulate_on_first_publish:
            typeof raw.backpopulate_on_first_publish === "boolean" ? raw.backpopulate_on_first_publish : undefined,
        backpopulate_lookback_ms:
            typeof raw.backpopulate_lookback_ms === "number" ? raw.backpopulate_lookback_ms : undefined,
    };
}
