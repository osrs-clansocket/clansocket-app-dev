import { streamText } from "ai";
import type { AiMessage } from "../../types.js";
import { buildLanguageModel } from "./llm.js";

export { writeSseEvent, writeSseComment } from "./sse-writer.js";

const ABORT_POLL_INTERVAL_MS = 100;

export function sleep(ms: number, abortRef: { aborted: boolean }): Promise<void> {
    if (ms <= 0) return Promise.resolve();
    return new Promise((resolve) => {
        const start = Date.now();
        const tick = (): void => {
            if (abortRef.aborted || Date.now() - start >= ms) resolve();
            else setTimeout(tick, Math.min(ABORT_POLL_INTERVAL_MS, ms - (Date.now() - start)));
        };
        setTimeout(tick, Math.min(ABORT_POLL_INTERVAL_MS, ms));
    });
}

export interface StreamLlmCall {
    apiKey: string;
    provider: string;
    model: string;
    maxTokens: number;
    system: string;
    messages: AiMessage[];
    onDelta: (text: string) => void;
    abortRef: { aborted: boolean };
}

export async function streamLlmCall(args: StreamLlmCall): Promise<string> {
    const { apiKey, provider, model, maxTokens, system, messages, onDelta, abortRef } = args;
    const languageModel = buildLanguageModel(provider, apiKey, model);
    const result = streamText({
        system,
        model: languageModel,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        maxOutputTokens: maxTokens,
    });
    const parts: string[] = [];
    for await (const chunk of result.textStream) {
        if (abortRef.aborted) break;
        parts.push(chunk);
        onDelta(chunk);
    }
    return parts.join("");
}
