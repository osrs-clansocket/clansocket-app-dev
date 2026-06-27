import { stepDispatcher } from "../dispatchers/step-dispatcher.js";
import type { ExecContext } from "../context/exec-context.js";
import type { DryRunTrace, DryRunStep } from "./dry-run-trace.js";

export async function runDryRun(
    execTemplate: Omit<ExecContext, "status" | "exitReason" | "failureReason">,
): Promise<DryRunTrace> {
    const exec: ExecContext = {
        ...execTemplate,
        status: "RUNNING",
        exitReason: null,
        failureReason: null,
    };
    const visitedSteps: DryRunStep[] = [];
    await stepDispatcher.advance(exec, {
        dryRun: true,
        onStep: (decision) => {
            visitedSteps.push({
                node_id: decision.nodeId,
                node_kind: decision.kind,
                decision: decision.decision,
                reason: decision.reason,
            });
        },
    });
    const outcome = outcomeFromStatus(exec.status);
    return {
        flow_id: exec.flowId,
        flow_version: exec.flowVersion,
        steps: visitedSteps,
        outcome,
        final_node_id: exec.currentStep,
    };
}

function outcomeFromStatus(status: ExecContext["status"]): "completed" | "exited" | "failed" {
    if (status === "EXITED") return "exited";
    if (status === "FAILED") return "failed";
    return "completed";
}
