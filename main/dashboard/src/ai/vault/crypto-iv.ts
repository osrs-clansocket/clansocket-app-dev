import { AES_IV_BYTES } from "./crypto-config.js";
import { randomBytes } from "./crypto-random.js";

export function newIv(): Uint8Array {
    return randomBytes(AES_IV_BYTES);
}
