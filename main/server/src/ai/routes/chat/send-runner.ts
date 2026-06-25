import logger from "@clansocket/logger";
import { type Response } from "express";
import { type ChainMode } from "../../persona/prompt/index.js";
import { chainGraph } from "../../chain/chain/index.js";
import { incomingQueue } from "../../lifecycle/incoming-queue.js";
import { chainStateStore } from "../../chain/chain-state-store.js";
import { startChain, type ChainStepResult } from "../../chain/chain-step/index.js";
import { CHAIN_MODE_CONTINUOUS, CHAIN_MODE_REACTIVE } from "../../chain/chain-modes.js";
import { type SendBody, resolveMaxTokens } from "./normalizers/body-validator.js";
import { normalizeHistory } from "./normalizers/history-normalizer.js";
import { normalizeModeOverrides, normalizePersonaOverrides } from "./normalizers/overrides-normalizer.js";
import { normalizeProfile } from "./normalizers/profile-normalizer.js";
import { openEventStream } from "../../../shared/http/sse-stream.js";
import { resolveModel } from "./llm.js";
import { runLlmIteration } from "./send-iteration.js";
import { writeSseEvent } from "./stream.js";

export interface SendCtx {
    body: SendBody;
    siteAccountId: string;
    res: Response;
    abortRef: { aborted: boolean };
}

export function prepareSse(res: Response): void {
    openEventStream(res, { cacheControl: "no-cache, no-transform", openComment: "stream-open" });
}

export function attachAbortClose(ctx: SendCtx): void {
    ctx.res.on("close", () => {
        if (!ctx.res.writableEnded && !ctx.abortRef.aborted) {
            logger.warn(
                `[ai/chat/send] client disconnected (res.close, !writableEnded) account=${ctx.siteAccountId} provider=${ctx.body.provider} model=${ctx.body.model ?? "(default)"}`,
            );
            ctx.abortRef.aborted = true;
        }
    });
}

function resolveChainMode(raw: string | undefined): ChainMode {
    return raw === CHAIN_MODE_CONTINUOUS ? CHAIN_MODE_CONTINUOUS : CHAIN_MODE_REACTIVE;
}

function normalizeLastTurn(body: SendBody): { raw: string; userMessage: string } | null {
    if (body.lastTurn && typeof body.lastTurn.raw === "string" && typeof body.lastTurn.userMessage === "string") {
        return { raw: body.lastTurn.raw, userMessage: body.lastTurn.userMessage };
    }
    return null;
}

function buildChainState(ctx: SendCtx, chainMode: ChainMode) {
    return chainStateStore.create({
        chainMode,
        siteAccountId: ctx.siteAccountId,
        instruction: ctx.body.text!,
        mode: ctx.body.mode!,
        pageState: ctx.body.pageState ?? null,
        history: normalizeHistory(ctx.body.history),
        profile: normalizeProfile(ctx.body.profile),
        personaOverrides: normalizePersonaOverrides(ctx.body.personaOverrides),
        modeOverrides: normalizeModeOverrides(ctx.body.modeOverrides),
        extraContext: [],
        lastTurn: normalizeLastTurn(ctx.body),
    });
}

function emitChainEvents(res: Response, step: ChainStepResult): void {
    for (const ev of step.events) writeSseEvent(res, { type: "chain-event", event: ev });
}

interface ChainLoopResult {
    step: ChainStepResult;
    iterations: number;
}

async function runChainLoop(ctx: SendCtx, state: ReturnType<typeof buildChainState>): Promise<ChainLoopResult> {
    const maxTokens = resolveMaxTokens(ctx.body.maxTokens);
    const model = resolveModel(ctx.body.provider!, ctx.body.model);
    logger.info(`[ai/chat/send] resolved model=${model} maxTokens=${maxTokens}`);
    let step: ChainStepResult = await startChain(state);
    emitChainEvents(ctx.res, step);
    let iterations = 0;
    while (step.kind === "call_llm") {
        iterations += 1;
        const cont = await runLlmIteration({
            step,
            iterations,
            model,
            maxTokens,
            res: ctx.res,
            abortRef: ctx.abortRef,
            apiKey: ctx.body.apiKey!,
            provider: ctx.body.provider!,
        });
        if (!cont.continueLoop) break;
        step = cont.nextStep;
        emitChainEvents(ctx.res, step);
    }
    return { step, iterations };
}

function finalizeStep(ctx: SendCtx, step: ChainStepResult, iterations: number): void {
    if (!ctx.abortRef.aborted && step.kind === "done") {
        writeSseEvent(ctx.res, { type: "done", result: step.result });
        logger.info(`[ai/chat/send] done emitted account=${ctx.siteAccountId} iters=${iterations}`);
        return;
    }
    logger.warn(
        `[ai/chat/send] exit without done aborted=${ctx.abortRef.aborted} stepKind=${step.kind} iters=${iterations}`,
    );
}

function handleSendError(ctx: SendCtx, err: unknown): void {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    const stackSuffix = stack ? `\n${stack}` : "";
    logger.error(`[ai/chat/send] threw: ${message}${stackSuffix}`);
    chainGraph.discard(ctx.siteAccountId);
    incomingQueue.clear(ctx.siteAccountId);
    if (!ctx.abortRef.aborted) writeSseEvent(ctx.res, { type: "error", error: message });
}

export async function runSend(ctx: SendCtx): Promise<void> {
    logger.info(
        `[ai/chat/send] start account=${ctx.siteAccountId} provider=${ctx.body.provider} model=${ctx.body.model ?? "(default)"} mode=${ctx.body.mode}`,
    );
    try {
        const chainMode = resolveChainMode(ctx.body.chainMode);
        if (chainGraph.active(ctx.siteAccountId)) {
            const queued = incomingQueue.enqueue(ctx.siteAccountId, ctx.body.text!);
            writeSseEvent(ctx.res, { type: "queued", queueLength: queued });
            ctx.res.end();
            return;
        }
        const state = buildChainState(ctx, chainMode);
        const { step, iterations } = await runChainLoop(ctx, state);
        finalizeStep(ctx, step, iterations);
    } catch (err) {
        handleSendError(ctx, err);
    } finally {
        ctx.res.end();
    }
}
