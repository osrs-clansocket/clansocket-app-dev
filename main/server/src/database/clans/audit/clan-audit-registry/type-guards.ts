import { isBoolean, isNumber, isPlainObject, isString } from "../../../../shared/validators/type-guards.js";

export { isBoolean, isNumber, isPlainObject, isString };

export type PayloadValidator = (payload: Record<string, unknown>) => boolean;

export const requireStrings =
    (...fields: readonly string[]): PayloadValidator =>
    (p) =>
        fields.every((f) => isString(p[f]));
