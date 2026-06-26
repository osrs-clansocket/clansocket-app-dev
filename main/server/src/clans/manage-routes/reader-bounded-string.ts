import { asString } from "../../shared/coerce.js";
import { MAX_PARAM_LENGTH } from "./validator-constants.js";

export function boundedString(value: unknown, maxLen: number): string | undefined {
    const s = asString(value);
    if (s === null || s.length === 0 || s.length > maxLen) return undefined;
    return s;
}

function readParam(value: unknown): string | undefined {
    return boundedString(value, MAX_PARAM_LENGTH);
}

export const readKindPrefix = readParam;
export const readActorParam = readParam;
