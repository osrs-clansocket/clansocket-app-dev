import { aiClient, type ChatResponse, type SendOptions } from "../../../../ai/client";
import type { ActionResult } from "../../../../ai/actions/action-types.js";
import { executeActions } from "../../../../ai/actions/action-executor/index.js";
import { updateThinking } from "../../thinking";
import { recordTurn, type ChainEvent } from "../storage";
import { awaitSlashSettle, buildFollowOptions } from "./preflight.js";
import { isQueuedResponse } from "./queue.js";
import { FOLLOWUP_PLACEHOLDER_TEXT, MAX_FOLLOWUP_DEPTH, type SendElements } from "./types.js";
import { makeEventHandler } from "./engine-events.js";

interface ChainTurnArgs {
    options: SendOptions;
    displayText: string;
    els: SendElements;
    signal: AbortSignal;
    depth: number;
}

interface ChainContinueArgs {
    actionResults: ActionResult[];
    response: ChatResponse;
    depth: number;
    els: SendElements;
    signal: AbortSignal;
}

async function runChainContinue(args: ChainContinueArgs): Promise<void> {
    const { actionResults, response, depth, els, signal } = args;
    if (depth >= MAX_FOLLOWUP_DEPTH) {
        els.addMsg({
            containerEl: els.messagesEl,
            text: `[AUTO-LIMIT REACHED] stopped action loop at depth ${depth}`,
            type: "status",
        });
        return;
    }
    await awaitSlashSettle();
    if (signal.aborted) return;
    const followup = buildFollowOptions(actionResults, response.chainId!);
    await runChainTurn({ els, signal, options: followup, displayText: FOLLOWUP_PLACEHOLDER_TEXT, depth: depth + 1 });
}

export async function runChainTurn({ options, displayText, els, signal, depth }: ChainTurnArgs): Promise<void> {
    const events: ChainEvent[] = [];
    const userTs = new Date().toISOString();
    const result = await aiClient.send(options, updateThinking, makeEventHandler(els, events), signal);
    if (isQueuedResponse(result)) return;
    const response = result;
    recordTurn({ userTs, response, events, userText: displayText, assistantTs: new Date().toISOString() });
    if (response.message) {
        els.addMsg({ containerEl: els.messagesEl, text: response.message, type: "ai", raw: response.raw });
    }
    const actionResults = await executeActions(response.actions, { chainId: response.chainId ?? undefined });
    if (els.onResponse) els.onResponse(response);
    if (signal.aborted) return;
    if (!response.chainContinues || actionResults.length === 0 || response.chainId === null) return;
    await runChainContinue({ actionResults, response, depth, els, signal });
}
