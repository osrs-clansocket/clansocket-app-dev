import { gateRegistry } from "../gates/gate-registry.js";
import { lookupOperation } from "../../registries/capability-registry.js";
import { readHold } from "../holds/hold-store.js";
import { enqueueReview } from "../../review/review-queue-store.js";
import { insertExecution, updateExecution } from "../store/execution-store.js";
import { claimCustomIdempotency } from "../store/idempotency-store.js";
import { resolveTemplate } from "../store/template-resolver.js";
import { memberPreferences } from "../../../database/clans/member-preferences-store.js";
import { isInQuietHours } from "../../../database/clans/quiet-hours-evaluator.js";
import { recordClanAudit } from "../../../database/index.js";
import { evaluateFilter } from "../../../filter/evaluators/dsl-evaluator.js";
import { toFilterContext } from "../context/exec-context.js";
import type { FilterAst } from "../../../filter/dsl-types.js";
import { BaseDispatcher } from "./base/base-dispatcher.js";
import { registerDispatcher } from "./dispatcher-registry.js";
import type { ExecContext } from "../context/exec-context.js";
import type { FlowNode } from "../../store/flow-definition-types.js";

const DEFAULT_IDEMPOTENCY_RETENTION_MS = 5 * 60_000;

export interface StepDecision {
    readonly nodeId: string;
    readonly kind: string;
    readonly decision: "would-fire" | "would-skip" | "would-pause" | "would-fail";
    readonly reason?: string;
}

function readStringConfig(node: FlowNode, key: string, fallback = ""): string {
    const v = node.config[key];
    return typeof v === "string" ? v : fallback;
}

function readArrayConfig(node: FlowNode, key: string): readonly unknown[] {
    const v = node.config[key];
    return Array.isArray(v) ? v : [];
}

function executeVariable(exec: ExecContext, node: FlowNode): void {
    const name = readStringConfig(node, "name");
    if (name.length === 0) return;
    exec.variables[name] = node.config.value ?? null;
}

function executeTracker(exec: ExecContext, node: FlowNode): void {
    const name = readStringConfig(node, "name");
    if (name.length === 0) return;
    const op = readStringConfig(node, "op", "set");
    const value = node.config.value;
    const current = exec.trackers[name];
    if (op === "increment") {
        const n = typeof current === "number" ? current : 0;
        const delta = typeof value === "number" ? value : 1;
        exec.trackers[name] = n + delta;
        return;
    }
    if (op === "append") {
        const list = Array.isArray(current) ? [...current] : [];
        list.push(value);
        exec.trackers[name] = list;
        return;
    }
    exec.trackers[name] = value ?? null;
}

function executeRandomPick(exec: ExecContext, node: FlowNode): void {
    const pool = readArrayConfig(node, "pool");
    if (pool.length === 0) return;
    const idx = Math.floor(Math.random() * pool.length);
    const out = readStringConfig(node, "output_variable");
    if (out.length > 0) exec.variables[out] = pool[idx];
}

function executeCyclePick(exec: ExecContext, node: FlowNode): void {
    const pool = readArrayConfig(node, "pool");
    if (pool.length === 0) return;
    const trackerKey = readStringConfig(node, "tracker_key", `cycle:${node.id}`);
    const current = exec.trackers[trackerKey];
    const idx = (typeof current === "number" ? current : -1) + 1;
    const wrapped = idx % pool.length;
    exec.trackers[trackerKey] = wrapped;
    const out = readStringConfig(node, "output_variable");
    if (out.length > 0) exec.variables[out] = pool[wrapped];
}

const UNIT_MS_MAP: Readonly<Record<string, number>> = {
    seconds: 1_000,
    minutes: 60_000,
    hours: 3_600_000,
    days: 86_400_000,
};

function executeDelay(exec: ExecContext, node: FlowNode, dryRun: boolean): void {
    if (dryRun) return;
    const value = typeof node.config.value === "number" ? node.config.value : 0;
    const unit = readStringConfig(node, "unit", "minutes");
    const ms = value * (UNIT_MS_MAP[unit] ?? UNIT_MS_MAP.minutes!);
    exec.status = "WAITING";
    exec.wakeAt = Date.now() + ms;
    exec.wakeEventKind = null;
    exec.wakeTimeoutAt = null;
}

function executeWaitForEvent(exec: ExecContext, node: FlowNode, dryRun: boolean): void {
    if (dryRun) return;
    const eventTriggerId = readStringConfig(node, "event_trigger_id");
    if (eventTriggerId.length === 0) return;
    const timeoutMs = typeof node.config.timeout_ms === "number" ? node.config.timeout_ms : null;
    exec.status = "WAITING";
    exec.wakeEventKind = eventTriggerId;
    exec.wakeAt = null;
    exec.wakeTimeoutAt = timeoutMs !== null ? Date.now() + timeoutMs : null;
}

function executeExhaustPick(exec: ExecContext, node: FlowNode): void {
    const pool = readArrayConfig(node, "pool");
    if (pool.length === 0) return;
    const trackerKey = readStringConfig(node, "tracker_key", `exhaust:${node.id}`);
    const drawn = exec.trackers[trackerKey];
    let drawnIndices = Array.isArray(drawn) ? (drawn as number[]).filter((n) => Number.isInteger(n)) : [];
    if (drawnIndices.length >= pool.length) drawnIndices = [];
    const remaining: number[] = [];
    for (let i = 0; i < pool.length; i += 1) if (!drawnIndices.includes(i)) remaining.push(i);
    if (remaining.length === 0) return;
    const pickIdx = remaining[Math.floor(Math.random() * remaining.length)]!;
    drawnIndices.push(pickIdx);
    exec.trackers[trackerKey] = drawnIndices;
    const out = readStringConfig(node, "output_variable");
    if (out.length > 0) exec.variables[out] = pool[pickIdx];
}

class StepDispatcher extends BaseDispatcher {
    public readonly kind = "step-dispatcher";

    public async advance(
        exec: ExecContext,
        opts: { dryRun?: boolean; onStep?: (decision: StepDecision) => void } = {},
    ): Promise<void> {
        const persistedId = !opts.dryRun && exec.executionId === 0 ? insertExecution(exec) : exec.executionId;
        const writeBack = (): void => {
            if (opts.dryRun) return;
            try {
                updateExecution(exec, persistedId);
            } catch {
            }
        };
        try {
            await this.runLoop(exec, opts);
        } finally {
            writeBack();
        }
    }

    private async runLoop(
        exec: ExecContext,
        opts: { dryRun?: boolean; onStep?: (decision: StepDecision) => void },
    ): Promise<void> {
        while (exec.status === "RUNNING") {
            const node = this.currentNode(exec);
            if (!node) {
                exec.status = "COMPLETED";
                return;
            }
            const status = node.status ?? "live";
            if (status === "draft") {
                opts.onStep?.({ nodeId: node.id, kind: node.kind, decision: "would-skip", reason: "draft-status" });
                this.advanceToNext(exec, node, "next");
                continue;
            }
            if (status === "manual") {
                if (!opts.dryRun) {
                    enqueueReview(exec.clanId, {
                        flowId: exec.flowId,
                        flowName: exec.flowName,
                        executionId: exec.executionId,
                        actionId: node.id,
                        operationRef: node.operation_ref ?? null,
                        resolvedInputs: node.config,
                        submittedAt: 0,
                    });
                }
                opts.onStep?.({ nodeId: node.id, kind: node.kind, decision: "would-pause", reason: "manual-status" });
                this.advanceToNext(exec, node, "next");
                continue;
            }
            const holdAction = this.checkHold(exec, node);
            if (holdAction === "wait") {
                exec.status = "WAITING";
                opts.onStep?.({ nodeId: node.id, kind: node.kind, decision: "would-pause", reason: "runtime-hold" });
                return;
            }
            if (holdAction === "skip") {
                opts.onStep?.({ nodeId: node.id, kind: node.kind, decision: "would-skip", reason: "runtime-skip" });
                this.advanceToNext(exec, node, "next");
                continue;
            }
            const gates = ["shape", "trigger-filter", "profile", "world"] as const;
            let advanced = false;
            for (const kind of gates) {
                const gate = gateRegistry.get(kind);
                if (!gate) continue;
                const result = gate.run({ exec, node });
                if (result.decision === "fail") {
                    exec.status = "FAILED";
                    exec.failureReason = result.reason ?? `gate ${kind} failed`;
                    opts.onStep?.({ nodeId: node.id, kind: node.kind, decision: "would-fail", reason: result.reason });
                    return;
                }
                if (result.decision === "skip") {
                    opts.onStep?.({ nodeId: node.id, kind: node.kind, decision: "would-skip", reason: result.reason });
                    this.advanceToNext(exec, node, "next");
                    advanced = true;
                    break;
                }
            }
            if (advanced) continue;
            opts.onStep?.({ nodeId: node.id, kind: node.kind, decision: "would-fire" });
            await this.executeNode(exec, node, opts);
        }
    }

    private checkHold(exec: ExecContext, node: FlowNode): "wait" | "skip" | "none" {
        if (node.kind !== "action") return "none";
        const overlay = readHold(exec.clanId, exec.flowId, node.id, 0);
        if (!overlay) return "none";
        return overlay.hold_status === "hold" ? "wait" : "skip";
    }

    private currentNode(exec: ExecContext): FlowNode | null {
        return exec.definition.nodes.find((n) => n.id === exec.currentStep) ?? null;
    }

    private async executeNode(exec: ExecContext, node: FlowNode, opts: { dryRun?: boolean }): Promise<void> {
        if (node.kind === "exit") {
            exec.status = "EXITED";
            const reason = node.config.reason;
            exec.exitReason = typeof reason === "string" ? reason : null;
            return;
        }
        if (node.kind === "action" && node.operation_ref) {
            await this.executeAction(exec, node, opts);
            return;
        }
        if (node.kind === "variable") {
            executeVariable(exec, node);
            this.advanceToNext(exec, node, "next");
            return;
        }
        if (node.kind === "tracker") {
            executeTracker(exec, node);
            this.advanceToNext(exec, node, "next");
            return;
        }
        if (node.kind === "random-pick") {
            executeRandomPick(exec, node);
            this.advanceToNext(exec, node, "next");
            return;
        }
        if (node.kind === "cycle-pick") {
            executeCyclePick(exec, node);
            this.advanceToNext(exec, node, "next");
            return;
        }
        if (node.kind === "exhaust-pick") {
            executeExhaustPick(exec, node);
            this.advanceToNext(exec, node, "next");
            return;
        }
        if (node.kind === "delay") {
            executeDelay(exec, node, opts.dryRun ?? false);
            return;
        }
        if (node.kind === "wait-for-event") {
            executeWaitForEvent(exec, node, opts.dryRun ?? false);
            return;
        }
        if (node.kind === "condition") {
            this.executeCondition(exec, node);
            return;
        }
        this.advanceToNext(exec, node, "next");
    }

    private executeCondition(exec: ExecContext, node: FlowNode): void {
        const filter = node.config.conditions as FilterAst | null | undefined;
        if (!filter) {
            this.advanceToNext(exec, node, "yes");
            return;
        }
        let matched = false;
        try {
            matched = evaluateFilter(filter, toFilterContext(exec));
        } catch {
            matched = false;
        }
        this.advanceToNext(exec, node, matched ? "yes" : "no");
    }

    private async executeAction(exec: ExecContext, node: FlowNode, opts: { dryRun?: boolean }): Promise<void> {
        const opSpec = lookupOperation(node.operation_ref ?? "");
        if (!opSpec) {
            exec.status = "FAILED";
            exec.failureReason = `unknown operation "${node.operation_ref}"`;
            return;
        }
        if (opts.dryRun) {
            this.advanceToNext(exec, node, "next");
            return;
        }
        const sendOptions = node.config.send_options as Readonly<Record<string, unknown>> | undefined;
        const keyTemplate = typeof sendOptions?.idempotency_key_template === "string"
            ? sendOptions.idempotency_key_template
            : null;
        if (keyTemplate && keyTemplate.length > 0) {
            const key = `action:${exec.clanId}:${resolveTemplate(keyTemplate, exec, node.id)}`;
            if (!claimCustomIdempotency(exec.clanId, key, DEFAULT_IDEMPOTENCY_RETENTION_MS)) {
                this.advanceToNext(exec, node, "next");
                return;
            }
        }
        const smartSend = sendOptions?.smart_send as Readonly<Record<string, unknown>> | undefined;
        if (smartSend && smartSend.enabled === true) {
            const windowMs = typeof smartSend.window_ms === "number" ? smartSend.window_ms : 60_000;
            const rsn = typeof exec.entity.rsn === "string" ? exec.entity.rsn : "";
            const key = `smart-send:${exec.clanId}:${exec.flowId}:${node.id}:${rsn}`;
            if (!claimCustomIdempotency(exec.clanId, key, windowMs)) {
                this.advanceToNext(exec, node, "next");
                return;
            }
        }
        const quietHours = sendOptions?.quiet_hours as Readonly<Record<string, unknown>> | undefined;
        const systemCritical = sendOptions?.system_critical === true;
        if (quietHours && quietHours.enabled === true && !systemCritical) {
            const rsn = typeof exec.entity.rsn === "string" ? exec.entity.rsn : "";
            const prefs = rsn.length > 0 ? memberPreferences(exec.clanId, rsn) : null;
            if (prefs && isInQuietHours(prefs, Date.now())) {
                this.advanceToNext(exec, node, "next");
                return;
            }
        }
        const channelClass = typeof sendOptions?.channel_class === "string" ? sendOptions.channel_class : null;
        if (channelClass && !systemCritical) {
            const rsn = typeof exec.entity.rsn === "string" ? exec.entity.rsn : "";
            const prefs = rsn.length > 0 ? memberPreferences(exec.clanId, rsn) : null;
            if (prefs && prefs.channelOptOut[channelClass] === true) {
                this.advanceToNext(exec, node, "next");
                return;
            }
        }
        const newsletterListId = typeof sendOptions?.newsletter_list_id === "string"
            ? sendOptions.newsletter_list_id
            : null;
        if (newsletterListId) {
            const rsn = typeof exec.entity.rsn === "string" ? exec.entity.rsn : "";
            const prefs = rsn.length > 0 ? memberPreferences(exec.clanId, rsn) : null;
            if (!prefs || prefs.newsletterOptIn[newsletterListId] !== true) {
                this.advanceToNext(exec, node, "next");
                return;
            }
        }
        let result;
        try {
            result = await opSpec.handler(node.config, {
                clanId: exec.clanId,
                flowId: exec.flowId,
                flowName: exec.flowName,
                flowVersion: exec.flowVersion,
                executionId: String(exec.executionId),
                botId: exec.botId,
                guildId: exec.guildId,
            });
        } catch (err) {
            exec.status = "FAILED";
            exec.failureReason = `op ${node.operation_ref}: ${(err as Error).message}`;
            return;
        }
        if (opSpec.side_effects.writes_audit === true) {
            try {
                const rsnEntity = typeof exec.entity.rsn === "string" ? exec.entity.rsn : null;
                recordClanAudit(exec.clanId, {
                    actor: `flow:${exec.flowId}`,
                    action: `flow:action.${result.result_class}` as never,
                    targetId: node.id,
                    payload: {
                        flowId: exec.flowId,
                        flowName: exec.flowName,
                        flowVersion: exec.flowVersion,
                        operationRef: node.operation_ref,
                        nodeId: node.id,
                        resultClass: result.result_class,
                        rsn: rsnEntity,
                        outputs: result.outputs,
                    } as never,
                });
            } catch {
            }
        }
        this.advanceToNext(exec, node, result.result_class);
    }

    private advanceToNext(exec: ExecContext, node: FlowNode, preferredHandle: string): void {
        const nextEdge =
            exec.definition.edges.find((e) => e.from_node_id === node.id && e.from_handle_id === preferredHandle) ??
            exec.definition.edges.find((e) => e.from_node_id === node.id);
        if (!nextEdge) {
            exec.status = "COMPLETED";
            return;
        }
        exec.currentStep = nextEdge.to_node_id;
    }
}

export const stepDispatcher = new StepDispatcher();
registerDispatcher(stepDispatcher);
