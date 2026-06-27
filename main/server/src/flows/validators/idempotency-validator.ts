import { BaseValidator } from "./base/base-validator.js";
import { lookupOperation } from "../registries/capability-registry.js";
import { registerValidator } from "./validator-registry.js";
import type { ValidatorContext, ValidatorFinding, ValidatorResult } from "./validator-types.js";

class IdempotencyValidator extends BaseValidator {
    public readonly id = "idempotency-validator";

    public run(ctx: ValidatorContext): ValidatorResult {
        const findings: ValidatorFinding[] = [];
        const parallelDescendants = this.collectParallelDescendants(ctx);
        for (const [parallelNodeId, descendantNodes] of parallelDescendants) {
            this.checkConflictingTargets(parallelNodeId, descendantNodes, ctx, findings);
        }
        return { findings };
    }

    private collectParallelDescendants(ctx: ValidatorContext): Map<string, Set<string>> {
        const out = new Map<string, Set<string>>();
        const nodeById = new Map(ctx.definition.nodes.map((n) => [n.id, n]));
        for (const node of ctx.definition.nodes) {
            if (node.kind !== "parallel") continue;
            const descendants = new Set<string>();
            this.walkDownstream(node.id, ctx, nodeById, descendants);
            out.set(node.id, descendants);
        }
        return out;
    }

    private walkDownstream(
        nodeId: string,
        ctx: ValidatorContext,
        nodeById: ReadonlyMap<string, ValidatorContext["definition"]["nodes"][number]>,
        descendants: Set<string>,
    ): void {
        const adjacency = ctx.definition.edges.filter((e) => e.from_node_id === nodeId);
        for (const edge of adjacency) {
            if (descendants.has(edge.to_node_id)) continue;
            descendants.add(edge.to_node_id);
            if (nodeById.get(edge.to_node_id)?.kind === "join") continue;
            this.walkDownstream(edge.to_node_id, ctx, nodeById, descendants);
        }
    }

    private checkConflictingTargets(
        parallelNodeId: string,
        descendants: Set<string>,
        ctx: ValidatorContext,
        findings: ValidatorFinding[],
    ): void {
        const operationCounts = new Map<string, string[]>();
        for (const node of ctx.definition.nodes) {
            if (!descendants.has(node.id)) continue;
            if (node.kind !== "action" || !node.operation_ref) continue;
            const opSpec = lookupOperation(node.operation_ref);
            if (!opSpec?.side_effects.writes_outbound && !opSpec?.side_effects.drafts_first) continue;
            const bucket = operationCounts.get(node.operation_ref) ?? [];
            bucket.push(node.id);
            operationCounts.set(node.operation_ref, bucket);
        }
        for (const [operationRef, nodeIds] of operationCounts) {
            if (nodeIds.length < 2) continue;
            findings.push(
                this.finding(
                    "acknowledgement",
                    `parallel branches from "${parallelNodeId}" both invoke "${operationRef}" — declare idempotency_key_template on each action to dedup at runtime`,
                    { node_id: parallelNodeId, suggestion: "acknowledge or split the parallel branches" },
                ),
            );
        }
    }
}

registerValidator(new IdempotencyValidator());
