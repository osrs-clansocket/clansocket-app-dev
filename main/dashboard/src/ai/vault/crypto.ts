import {
    deriveKey as _deriveKey,
    newSalt as _newSalt,
    DEFAULT_ITERATIONS as _DEFAULT_ITERATIONS,
    DerivedKey as _DerivedKey,
} from "./crypto-pbkdf2.js";
export const deriveKey = _deriveKey;
export const newSalt = _newSalt;
export const DEFAULT_ITERATIONS = _DEFAULT_ITERATIONS;
export type DerivedKey = _DerivedKey;
import {
    decrypt as _decrypt,
    encrypt as _encrypt,
    newIv as _newIv,
    EncryptedBlob as _EncryptedBlob,
} from "./crypto-aes.js";
export const decrypt = _decrypt;
export const encrypt = _encrypt;
export const newIv = _newIv;
export type EncryptedBlob = _EncryptedBlob;
