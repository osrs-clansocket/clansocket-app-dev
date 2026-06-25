export interface ValidationOk {
    ok: true;
    warnings: string[];
}

export interface ValidationFail {
    ok: false;
    errors: string[];
    warnings: string[];
}

export type ValidationResult = ValidationOk | ValidationFail;
