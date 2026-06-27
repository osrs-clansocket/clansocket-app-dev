import type {
    ValidatorContext,
    ValidatorFinding,
    ValidatorResult,
    ValidatorSeverity,
    ValidatorSpec,
} from "../validator-types.js";

export abstract class BaseValidator implements ValidatorSpec {
    public abstract readonly id: string;

    public abstract run(ctx: ValidatorContext): ValidatorResult;

    protected finding(
        severity: ValidatorSeverity,
        message: string,
        extras: Omit<ValidatorFinding, "validator_id" | "severity" | "message"> = {},
    ): ValidatorFinding {
        return { validator_id: this.id, severity, message, ...extras };
    }

    protected ok(): ValidatorResult {
        return { findings: [] };
    }
}
