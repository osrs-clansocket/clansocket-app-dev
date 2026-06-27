import { BaseValidator } from "./base/base-validator.js";
import { registerValidator } from "./validator-registry.js";
import type { ValidatorContext, ValidatorFinding, ValidatorResult } from "./validator-types.js";

class DeadHandleValidator extends BaseValidator {
    public readonly id = "dead-handle-validator";

    public run(ctx: ValidatorContext): ValidatorResult {
        const findings: ValidatorFinding[] = [];
        const wiredHandles = this.collectWiredHandles(ctx);
        const wiredInputs = this.collectWiredInputs(ctx);
        for (const node of ctx.definition.nodes) {
            for (const handle of node.output_handles) {
                const key = `${node.id}:${handle.id}`;
                if (!wiredHandles.has(key)) {
                    findings.push(
                        this.finding(
                            "warning",
                            `output handle "${handle.id}" on node "${node.id}" has no outgoing edge`,
                            {
                                node_id: node.id,
                                handle_id: handle.id,
                            },
                        ),
                    );
                }
            }
            if (node.id !== ctx.definition.entry_node_id && !wiredInputs.has(node.id) && node.kind !== "exit") {
                findings.push(
                    this.finding("error", `node "${node.id}" is unreachable (no inbound edge)`, {
                        node_id: node.id,
                    }),
                );
            }
        }
        return { findings };
    }

    private collectWiredHandles(ctx: ValidatorContext): Set<string> {
        const wired = new Set<string>();
        for (const edge of ctx.definition.edges) {
            wired.add(`${edge.from_node_id}:${edge.from_handle_id}`);
        }
        return wired;
    }

    private collectWiredInputs(ctx: ValidatorContext): Set<string> {
        const wired = new Set<string>();
        for (const edge of ctx.definition.edges) wired.add(edge.to_node_id);
        return wired;
    }
}

registerValidator(new DeadHandleValidator());
