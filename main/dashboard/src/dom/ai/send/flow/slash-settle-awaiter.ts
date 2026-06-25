import { PAGE_SETTLE_MS } from "./types.js";

export function awaitSlashSettle(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, PAGE_SETTLE_MS));
}
