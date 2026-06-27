import { BaseRegistry } from "../../base/base-registry.js";
import type { ValidatorContext, ValidatorFinding, ValidatorSpec } from "./validator-types.js";

class ValidatorRegistryStore extends BaseRegistry<string, ValidatorSpec> {}

export const validatorRegistry = new ValidatorRegistryStore();

export function registerValidator(spec: ValidatorSpec): void {
    validatorRegistry.registerUnique(spec.id, spec, (key) => new Error(`validator "${key}" already registered`));
}

export function runAllValidators(ctx: ValidatorContext): readonly ValidatorFinding[] {
    const findings: ValidatorFinding[] = [];
    for (const spec of validatorRegistry.list()) {
        const result = spec.run(ctx);
        findings.push(...result.findings);
    }
    return findings;
}
