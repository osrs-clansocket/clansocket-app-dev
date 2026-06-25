import { identityClient } from "../../state/identity/identity-client/index.js";
import { history } from "../../dom/ai/send/storage";
import { modesStore } from "../modes-store/index.js";
import { personaStore } from "../persona-store/index.js";
import { profileStore } from "../profile-store";
import { SEND_KIND_USER, type AttemptResult, type SendOptions } from "./types.js";

export interface AttemptParams {
    provider: string;
    config: { apiKey: string; maxTokens?: number; model?: string };
    opts: SendOptions;
    onStatus?: import("./types.js").StatusFn;
    onEvent?: import("./types.js").EventFn;
    signal?: AbortSignal;
}

function buildRequestBody(p: AttemptParams): unknown {
    const { provider, config, opts } = p;
    return {
        history,
        provider,
        text: opts.text,
        mode: opts.mode,
        pageState: opts.pageState,
        chainMode: opts.chainMode,
        kind: opts.kind ?? SEND_KIND_USER,
        actionResults: opts.actionResults,
        priorChainId: opts.priorChainId,
        profile: profileStore.load(),
        personaOverrides: personaStore.snapshot(),
        modeOverrides: modesStore.snapshot(),
        apiKey: config.apiKey,
        model: config.model,
        maxTokens: config.maxTokens,
    };
}

export async function postChat(p: AttemptParams): Promise<Response> {
    return identityClient.authedJsonFetch("/api/ai/chat/send", "POST", buildRequestBody(p), { signal: p.signal });
}

export async function readHttpError(res: Response): Promise<AttemptResult> {
    const text = await res.text().catch(() => "");
    return { httpError: `${res.status}: ${text || res.statusText}` };
}
