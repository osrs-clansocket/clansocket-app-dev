import { deleteRecord } from "./storage.js";

export async function wipeVault(): Promise<void> {
    await deleteRecord();
}
