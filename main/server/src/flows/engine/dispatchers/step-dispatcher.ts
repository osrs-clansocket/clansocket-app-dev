import { gateRegistry } from "../gates/gate-registry.js";
import { lookupOperation } from "../../registries/capability-registry.js";
import { readHold } from "../holds/hold-store.js";
import { enqueueReview } from "../../review/review-queue-store.js";
import { BaseDispatcher } from "./base/base-dispatcher.js";
import { registerDispatcher } from "./dispatcher-registry.js";
import type { ExecContext } from "../context/exec-context.js";
import type { FlowNode } from "../../store/flow-definition-types.js";

export interface StepDecision {
    readonly nodeId: string;
    readonly kind: string;
    readonly decision: "would-fire" | "would-skip" | "would-pause" | "would-fail";
    readonly reason?: string;
}

class StepDispatcher extends BaseDispatcher {
    public readonly kind = "step-dispatcher";

    public async advance(
        exec: ExecContext,
        opts: { dryRun?: boolean; onStep?: (decision: StepDecision) => void } = {},
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
        this.advanceToNext(exec, node, "next");
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
        const result = await opSpec.handler(node.config, {
            clanId: exec.clanId,
            flowId: exec.flowId,
            flowName: exec.flowName,
            flowVersion: exec.flowVersion,
            executionId: String(exec.executionId),
            botId: exec.botId,
            guildId: exec.guildId,
        });
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
