import { sampleFromAlphabet } from "../../shared/alphabet-sampler.js";

const BACKUP_CODE_GROUP = 4;
const BACKUP_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function encodeBytes(buf: Buffer): string {
    return sampleFromAlphabet(buf, BACKUP_CODE_ALPHABET);
}

export function formatHumanReadable(raw: string): string {
    const groups: string[] = [];
    for (let i = 0; i < raw.length; i += BACKUP_CODE_GROUP) {
        groups.push(raw.slice(i, i + BACKUP_CODE_GROUP));
    }
    return groups.join("-");
}
