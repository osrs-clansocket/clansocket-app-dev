import { readRecord } from "./storage.js";

export async function vaultExists(): Promise<boolean> {
    const r = await readRecord();
    return r !== null;
}
