import { SALT_BYTES } from "./crypto-config.js";
import { randomBytes } from "./crypto-random.js";

export function newSalt(): Uint8Array {
    return randomBytes(SALT_BYTES);
}
