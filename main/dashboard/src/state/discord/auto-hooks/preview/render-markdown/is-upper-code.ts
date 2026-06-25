import { CHARCODE_UPPER_A, CHARCODE_UPPER_Z } from "../../../../../shared/constants/ascii-constants.js";

export function isUpperCode(code: number): boolean {
    return code >= CHARCODE_UPPER_A && code <= CHARCODE_UPPER_Z;
}
