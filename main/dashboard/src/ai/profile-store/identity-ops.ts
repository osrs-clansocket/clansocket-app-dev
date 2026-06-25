import { readStored, writeStored } from "./storage.js";
import type { StoredProfile } from "./types.js";
import { isValidKey } from "./validation.js";

function commit(stored: StoredProfile): void {
    stored.updatedAt = Date.now();
    writeStored(stored);
}

export function setIdentityOp(key: string, value: string): boolean {
    if (!isValidKey(key)) return false;
    const stored = readStored();
    stored.identity[key] = value;
    commit(stored);
    return true;
}

function sameKey(oldKey: string, newKey: string): boolean {
    return oldKey === newKey;
}

export function renameIdentityOp(oldKey: string, newKey: string, value: string): boolean {
    if (!isValidKey(newKey)) return false;
    const stored = readStored();
    if (!sameKey(oldKey, newKey)) delete stored.identity[oldKey];
    stored.identity[newKey] = value;
    commit(stored);
    return true;
}

export function removeIdentityOp(key: string): void {
    const stored = readStored();
    delete stored.identity[key];
    commit(stored);
}

export function renamePrefixOp(oldPrefix: string, newPrefix: string): boolean {
    if (!isValidKey(newPrefix)) return false;
    if (sameKey(oldPrefix, newPrefix)) return true;
    const stored = readStored();
    const toRename: [string, string][] = [];
    for (const key of Object.keys(stored.identity)) {
        if (key === oldPrefix) {
            toRename.push([key, newPrefix]);
        } else if (key.startsWith(oldPrefix + ".")) {
            toRename.push([key, newPrefix + key.slice(oldPrefix.length)]);
        }
    }
    if (toRename.length === 0) return false;
    for (const [oldKey, newKey] of toRename) {
        const value = stored.identity[oldKey]!;
        delete stored.identity[oldKey];
        stored.identity[newKey] = value;
    }
    commit(stored);
    return true;
}

export function removePrefixOp(prefix: string): void {
    const stored = readStored();
    let dirty = false;
    for (const key of Object.keys(stored.identity)) {
        if (key === prefix || key.startsWith(prefix + ".")) {
            delete stored.identity[key];
            dirty = true;
        }
    }
    if (dirty) commit(stored);
}
