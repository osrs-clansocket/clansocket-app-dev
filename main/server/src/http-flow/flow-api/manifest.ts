import { registerOperation } from "../../flows/registries/operation-registry.js";
import { buildCapabilityFromRegistries } from "../../flows/registries/capability-builder.js";
import type { CapabilityManifest, OperationContext, OperationResult } from "../../flows/registries/registry-types.js";
import type { FlowFieldList } from "../../flows/registries/payload-field-types.js";

const CAPABILITY_NAME = "http";
const CAPABILITY_COLOR = "graphite";
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 65_536;
const RESULT_CLASSES: readonly string[] = ["2xx", "4xx", "5xx", "network_error", "timeout"];

const OUTPUT_FIELDS: FlowFieldList = [
    { name: "statusCode", type: "integer" },
    { name: "bodyPreview", type: "string" },
    { name: "truncated", type: "boolean" },
];

const URL_FIELD = {
    name: "url",
    type: "string" as const,
    required: true,
    minLength: 8,
    maxLength: 2048,
};

const HEADERS_FIELD = { name: "headers", type: "string" as const };

const POST_INPUT: FlowFieldList = [
    URL_FIELD,
    { name: "body", type: "string", maxLength: MAX_RESPONSE_BYTES },
    { name: "contentType", type: "mime-type", valueSourceRef: "mime-type" },
    HEADERS_FIELD,
];

const GET_INPUT: FlowFieldList = [URL_FIELD, HEADERS_FIELD];

function resultClassFor(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return "2xx";
    if (statusCode >= 400 && statusCode < 500) return "4xx";
    if (statusCode >= 500) return "5xx";
    return "network_error";
}

function readString(input: Readonly<Record<string, unknown>>, key: string): string {
    const v = input[key];
    if (typeof v !== "string" || v.length === 0) throw new Error(`http: missing required "${key}"`);
    return v;
}

function readHeaders(input: Readonly<Record<string, unknown>>): Record<string, string> {
    const raw = input.headers;
    if (!raw || typeof raw !== "object") return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
        if (typeof v === "string") out[k] = v;
    }
    return out;
}

function readContentType(input: Readonly<Record<string, unknown>>): string {
    const v = input.contentType;
    return typeof v === "string" && v.length > 0 ? v : "application/json";
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

async function readBoundedBody(response: Response): Promise<{ bodyPreview: string; truncated: boolean }> {
    const text = await response.text();
    if (text.length <= MAX_RESPONSE_BYTES) return { bodyPreview: text, truncated: false };
    return { bodyPreview: text.slice(0, MAX_RESPONSE_BYTES), truncated: true };
}

async function performHttp(method: string, input: Readonly<Record<string, unknown>>): Promise<OperationResult> {
    const url = readString(input, "url");
    const headers = readHeaders(input);
    const init: RequestInit = { method, headers };
    if (method === "POST" || method === "PUT") {
        const body = typeof input.body === "string" ? input.body : "";
        init.body = body;
        if (!headers["content-type"] && !headers["Content-Type"]) {
            (init.headers as Record<string, string>)["content-type"] = readContentType(input);
        }
    }
    try {
        const response = await fetchWithTimeout(url, init);
        const body = await readBoundedBody(response);
        return {
            result_class: resultClassFor(response.status),
            outputs: { statusCode: response.status, bodyPreview: body.bodyPreview, truncated: body.truncated },
        };
    } catch (err) {
        const name = (err as Error).name;
        if (name === "AbortError") return { result_class: "timeout", outputs: { statusCode: 0 } };
        return { result_class: "network_error", outputs: { statusCode: 0, error: (err as Error).message } };
    }
}

function httpHandler(method: string) {
    return async (input: Readonly<Record<string, unknown>>, _ctx: OperationContext): Promise<OperationResult> =>
        performHttp(method, input);
}

function httpOp(opId: string, inputFields: FlowFieldList, method: string): void {
    registerOperation({
        capability: CAPABILITY_NAME,
        opId,
        safety_tier: "manual",
        inputFields,
        outputFields: OUTPUT_FIELDS,
        result_classes: RESULT_CLASSES,
        side_effects: { writes_audit: true },
        validation: {},
        handler: httpHandler(method),
    });
}

httpOp("http:post", POST_INPUT, "POST");
httpOp("http:get", GET_INPUT, "GET");
httpOp("http:put", POST_INPUT, "PUT");
httpOp("http:delete", GET_INPUT, "DELETE");

export const manifest: CapabilityManifest = buildCapabilityFromRegistries({
    name: CAPABILITY_NAME,
    version: "0.2.0",
    capability_color: CAPABILITY_COLOR,
});
