import { profileStore } from "../profile-store";
import { emitChainEvent, parseEvents } from "./sse-parse.js";
import { postChat, readHttpError, type AttemptParams } from "./attempt-request.js";
import type { AttemptResult, ChatResponse, EventFn, StatusFn } from "./types.js";

export type { AttemptParams } from "./attempt-request.js";

interface StreamState {
    finalResponse?: ChatResponse;
    queued?: number;
    streamingNotified: boolean;
    committed: boolean;
}

interface StreamEvent {
    type: string;
    event?: { type: string; payload: Record<string, unknown> };
    queueLength?: number;
    result?: ChatResponse;
    error?: string;
}

const ACK = true;

function applyCommitEvent(
    ev: StreamEvent,
    state: StreamState,
    onStatus: StatusFn | undefined,
    onEvent: EventFn | undefined,
): boolean {
    if (ev.type === "chain-event" && ev.event) {
        state.committed = ACK;
        emitChainEvent(ev.event, onStatus, onEvent);
        return true;
    }
    if (ev.type === "delta") {
        state.committed = ACK;
        if (!state.streamingNotified && onStatus) {
            onStatus("Streaming...");
            state.streamingNotified = ACK;
        }
        return true;
    }
    return false;
}

function handleStreamEvent(
    ev: StreamEvent,
    state: StreamState,
    onStatus: StatusFn | undefined,
    onEvent: EventFn | undefined,
): AttemptResult | undefined {
    if (applyCommitEvent(ev, state, onStatus, onEvent)) return undefined;
    if (ev.type === "queued" && typeof ev.queueLength === "number") state.queued = ev.queueLength;
    else if (ev.type === "done" && ev.result) state.finalResponse = ev.result;
    else if (ev.type === "error" && typeof ev.error === "string")
        return { streamError: ev.error, committed: state.committed };
    return undefined;
}

function streamFinalResult(state: StreamState): AttemptResult {
    if (state.queued !== undefined) return { result: { queued: ACK, queueLength: state.queued } };
    if (state.finalResponse) {
        if (state.finalResponse.profileContext) profileStore.applyAiResponse(state.finalResponse.profileContext);
        return { result: state.finalResponse };
    }
    return { streamError: "stream closed without done/error event (check server logs)", committed: state.committed };
}

async function drainStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onStatus: StatusFn | undefined,
    onEvent: EventFn | undefined,
): Promise<AttemptResult> {
    const decoder = new TextDecoder();
    const state: StreamState = { streamingNotified: false, committed: false };
    let pending = "";
    for (;;) {
        const r = await reader.read();
        if (r.done) break;
        const chunk = decoder.decode(r.value, { stream: true });
        const parsed = parseEvents(pending.length === 0 ? chunk : `${pending}${chunk}`);
        pending = parsed.rest;
        for (const ev of parsed.events) {
            const early = handleStreamEvent(ev, state, onStatus, onEvent);
            if (early) return early;
        }
    }
    return streamFinalResult(state);
}

export async function attemptChat(p: AttemptParams): Promise<AttemptResult> {
    const res = await postChat(p);
    if (!res.ok || !res.body) return readHttpError(res);
    return drainStream(res.body.getReader(), p.onStatus, p.onEvent);
}
