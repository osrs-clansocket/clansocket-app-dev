import {
    PERMISSION_STATE_ALLOW,
    PERMISSION_STATE_DENY,
    PERMISSION_STATE_INHERIT,
} from "../../../../shared/constants/clan-manage-discord/permission-flags-constants.js";
import { safeBigInt } from "./permission-format.js";

export function tristateFor(allow: string, deny: string, bit: number): string {
    const mask = 1n << BigInt(bit);
    if ((safeBigInt(allow) & mask) !== 0n) return PERMISSION_STATE_ALLOW;
    if ((safeBigInt(deny) & mask) !== 0n) return PERMISSION_STATE_DENY;
    return PERMISSION_STATE_INHERIT;
}
