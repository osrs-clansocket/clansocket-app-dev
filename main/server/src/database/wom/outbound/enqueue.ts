import { STATUS_PENDING } from "../../../shared/constants/outbound-status.js";
import { sha256Hex } from "../../../shared/hash.js";
import { randomUUID } from "node:crypto";
import { runWomWrite } from "../db-runners.js";

const INITIAL_ATTEMPTS = 0;
const DEFAULT_REQUEST_METHOD = "GET";

export type WomRequestMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface WomRequestInput {
    clanId: string;
    requestKind: string;
    requestPath: string;
    requestMethod?: WomRequestMethod;
    query?: Record<string, string | number>;
    body?: unknown;
    scheduledAtMs?: number;
}

const INSERT_SQL = `INSERT INTO clan_wom_outbound_events (
    queue_id, request_kind, request_path, request_method,
    query_json, body_json, payload_hash, dedup_hash,
    status, attempts, scheduled_at, created_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

function computePayloadHash(method: string, path: string, queryJson: string | null, bodyJson: string | null): string {
    return sha256Hex(`${method}|${path}|${queryJson ?? ""}|${bodyJson ?? ""}`);
}

function computeDedupHash(clanId: string, requestKind: string, payloadHash: string): string {
    return sha256Hex(`${clanId}|${requestKind}|${payloadHash}`);
}

interface NormalizedRequest {
    method: string;
    queryJson: string | null;
    bodyJson: string | null;
    payloadHash: string;
    dedupHash: string;
}

function normalizeRequest(input: WomRequestInput): NormalizedRequest {
    const method = input.requestMethod ?? DEFAULT_REQUEST_METHOD;
    const queryJson = input.query ? JSON.stringify(input.query) : null;
    const bodyJson = input.body !== undefined ? JSON.stringify(input.body) : null;
    const payloadHash = computePayloadHash(method, input.requestPath, queryJson, bodyJson);
    const dedupHash = computeDedupHash(input.clanId, input.requestKind, payloadHash);
    return { method, queryJson, bodyJson, payloadHash, dedupHash };
}

export function enqueueWomRequest(input: WomRequestInput): string {
    const now = Date.now();
    const queueId = randomUUID();
    const n = normalizeRequest(input);
    runWomWrite(
        input.clanId,
        INSERT_SQL,
        queueId,
        input.requestKind,
        input.requestPath,
        n.method,
        n.queryJson,
        n.bodyJson,
        n.payloadHash,
        n.dedupHash,
        STATUS_PENDING,
        INITIAL_ATTEMPTS,
        input.scheduledAtMs ?? now,
        now,
        now,
    );
    return queueId;
}
