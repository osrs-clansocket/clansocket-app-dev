import logger from "@clansocket/logger";
import { type Response } from "express";
import { advanceChain, type ChainStepResult } from "../../chain/chain-step/index.js";
import { sleep, streamLlmCall, writeSseEvent } from "./stream.js";

const MS_PER_SECOND = 1000;

export interface RunIterationArgs {
    step: Extract<ChainStepResult, { kind: "call_llm" }>;
    iterations: number;
    abortRef: { aborted: boolean };
    res: Response;
    model: string;
    maxTokens: number;
    apiKey: string;
    provider: string;
}

export interface IterationOutcome {
    continueLoop: boolean;
    nextStep: ChainStepResult;
}

async function checkPreAbort(args: RunIterationArgs): Promise<boolean> {
    const { step, iterations, abortRef } = args;
    if (abortRef.aborted) {
        logger.warn(`[ai/chat/send] loop break iter=${iterations} reason=aborted (pre-llm)`);
        return true;
    }
    if (step.nextPollSeconds !== null && step.nextPollSeconds > 0) {
        await sleep(step.nextPollSeconds * MS_PER_SECOND, abortRef);
        if (abortRef.aborted) {
            logger.warn(`[ai/chat/send] loop break iter=${iterations} reason=aborted (post-sleep)`);
            return true;
        }
    }
    return false;
}

export async function runLlmIteration(args: RunIterationArgs): Promise<IterationOutcome> {
    const { step, iterations, abortRef, res, model, maxTokens, apiKey, provider } = args;
    if (await checkPreAbort(args)) return { continueLoop: false, nextStep: step };
    const llmText = await streamLlmCall({
        model,
        maxTokens,
        abortRef,
        apiKey,
        provider,
        system: step.system,
        messages: step.messages,
        onDelta: (delta) => writeSseEvent(res, { type: "delta", delta }),
    });
    logger.info(`[ai/chat/send] llm returned iter=${iterations} bytes=${llmText.length} aborted=${abortRef.aborted}`);
    if (abortRef.aborted) {
        logger.warn(`[ai/chat/send] loop break iter=${iterations} reason=aborted (post-llm)`);
        return { continueLoop: false, nextStep: step };
    }
    return { continueLoop: true, nextStep: await advanceChain(step.chainId, llmText) };
}
