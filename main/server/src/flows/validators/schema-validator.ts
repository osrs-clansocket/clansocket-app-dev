import { BaseValidator } from "./base/base-validator.js";
import { lookupOperation, lookupTrigger } from "../registries/capability-registry.js";
import { registerValidator } from "./validator-registry.js";
import type { ValidatorContext, ValidatorFinding, ValidatorResult } from "./validator-types.js";

class SchemaValidator extends BaseValidator {
    public readonly id = "schema-validator";

    public run(ctx: ValidatorContext): ValidatorResult {
        const findings: ValidatorFinding[] = [];
        this.validateTrigger(ctx, findings);
        this.validateActionNodes(ctx, findings);
        return { findings };
    }

    private validateTrigger(ctx: ValidatorContext, findings: ValidatorFinding[]): void {
        const triggerType = ctx.definition.trigger_type;
        const triggerConfig = ctx.definition.trigger_config;
        if (triggerType !== "event") return;
        const eventSource = triggerConfig.event_source;
        if (!eventSource) {
            findings.push(this.finding("error", "event trigger requires trigger_config.event_source"));
            return;
        }
        const spec = lookupTrigger(eventSource);
        if (!spec) {
            findings.push(
                this.finding("error", `unknown trigger event_source "${eventSource}"`, {
                    suggestion: "check the capability manifest defines this trigger id",
                }),
            );
        }
    }

    private validateActionNodes(ctx: ValidatorContext, findings: ValidatorFinding[]): void {
        for (const node of ctx.definition.nodes) {
            if (node.kind !== "action") continue;
            const operationRef = node.operation_ref;
            if (!operationRef) {
                findings.push(
                    this.finding("error", `action node "${node.id}" missing operation_ref`, { node_id: node.id }),
                );
                continue;
            }
            const opSpec = lookupOperation(operationRef);
            if (!opSpec) {
                findings.push(
                    this.finding("error", `action node "${node.id}" references unknown operation "${operationRef}"`, {
                        node_id: node.id,
                    }),
                );
                continue;
            }
            this.validateNodeOutputHandlesAgainstResultClasses(node, opSpec.result_classes, findings);
        }
    }

    private validateNodeOutputHandlesAgainstResultClasses(
        node: ValidatorContext["definition"]["nodes"][number],
        resultClasses: readonly string[],
        findings: ValidatorFinding[],
    ): void {
        const allowed = new Set<string>([...resultClasses, "next"]);
        for (const handle of node.output_handles) {
            if (!allowed.has(handle.id)) {
                findings.push(
                    this.finding(
                        "error",
                        `action node "${node.id}" output handle "${handle.id}" is not declared in operation result_classes`,
                        { node_id: node.id, handle_id: handle.id },
                    ),
                );
            }
        }
    }
}

registerValidator(new SchemaValidator());
