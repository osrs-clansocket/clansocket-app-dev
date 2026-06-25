import { randomBytes, timingSafeEqual } from "node:crypto";
import { sampleFromAlphabet } from "../shared/alphabet-sampler.js";
import { sha256Hex } from "../shared/hash.js";

const TOKEN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TOKEN_GROUP_SIZE = 3;
const TOKEN_GROUPS = 3;

function pickChars(count: number): string {
    return sampleFromAlphabet(randomBytes(count), TOKEN_ALPHABET);
}

export function pluginAuthToken(): string {
    const groups: string[] = [];
    for (let g = 0; g < TOKEN_GROUPS; g += 1) {
        groups.push(pickChars(TOKEN_GROUP_SIZE));
    }
    return groups.join("-");
}

export function hashToken(plaintext: string): string {
    return sha256Hex(plaintext);
}

export function verifyTokenHash(plaintext: string, stored: string): boolean {
    const actual = Buffer.from(hashToken(plaintext), "hex");
    const expected = Buffer.from(stored, "hex");
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
}
