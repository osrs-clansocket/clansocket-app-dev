import type {
    CapabilityManifest,
    JSONSchema,
    OperationContext,
    OperationResult,
    OperationSpec,
} from "../../flows/registries/registry-types.js";

const CAPABILITY_NAME = "http";
const CAPABILITY_COLOR = "graphite";
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 65_536;

const URL_INPUT: JSONSchema = {
    type: "string",
    minLength: 8,
    maxLength: 2048,
    pattern: "^https://",
};

const HEADERS_INPUT: JSONSchema = {
    type: "object",
    additionalProperties: { type: "string", maxLength: 1024 },
};

const HTTP_RESULT_SCHEMA: JSONSchema = {
    type: "object",
    properties: {
        statusCode: { type: "integer" },
        bodyPreview: { type: "string" },
        truncated: { type: "boolean" },
    },
};

const POST_INPUT: JSONSchema = {
    type: "object",
    required: ["url"],
    additionalProperties: false,
    properties: {
        url: URL_INPUT,
        body: { type: "string", maxLength: MAX_RESPONSE_BYTES },
        contentType: {
            type: "string",
            enum: [
                "application/json",
                "application/x-www-form-urlencoded",
                "text/plain",
                "text/html",
                "application/xml",
            ],
            enumLabels: [
                "JSON",
                "Form-urlencoded",
                "Plain text",
                "HTML",
                "XML",
            ],
        },
        headers: HEADERS_INPUT,
    },
};

const GET_INPUT: JSONSchema = {
    type: "object",
    required: ["url"],
    additionalProperties: false,
    properties: {
        url: URL_INPUT,
        headers: HEADERS_INPUT,
    },
};

const PUT_INPUT: JSONSchema = POST_INPUT;

const DELETE_INPUT: JSONSchema = GET_INPUT;

const RESULT_CLASSES: readonly string[] = ["2xx", "4xx", "5xx", "network_error", "timeout"];

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

async function httpPostHandler(input: Readonly<Record<string, unknown>>, _ctx: OperationContext): Promise<OperationResult> {
    return performHttp("POST", input);
}

async function httpGetHandler(input: Readonly<Record<string, unknown>>, _ctx: OperationContext): Promise<OperationResult> {
    return performHttp("GET", input);
}

async function httpPutHandler(input: Readonly<Record<string, unknown>>, _ctx: OperationContext): Promise<OperationResult> {
    return performHttp("PUT", input);
}

async function httpDeleteHandler(input: Readonly<Record<string, unknown>>, _ctx: OperationContext): Promise<OperationResult> {
    return performHttp("DELETE", input);
}

function httpOp(input_schema: JSONSchema, handler: OperationSpec["handler"]): OperationSpec {
    return {
        safety_tier: "manual",
        input_schema,
        output_schema: HTTP_RESULT_SCHEMA,
        side_effects: { writes_audit: true },
        validation: {},
        result_classes: RESULT_CLASSES,
        handler,
    };
}

export const manifest: CapabilityManifest = {
    name: CAPABILITY_NAME,
    version: "0.1.0",
    capability_color: CAPABILITY_COLOR,
    operations: {
        "http:post": httpOp(POST_INPUT, httpPostHandler),
        "http:get": httpOp(GET_INPUT, httpGetHandler),
        "http:put": httpOp(PUT_INPUT, httpPutHandler),
        "http:delete": httpOp(DELETE_INPUT, httpDeleteHandler),
    },
    triggers: {},
    data_sources: {},
};
