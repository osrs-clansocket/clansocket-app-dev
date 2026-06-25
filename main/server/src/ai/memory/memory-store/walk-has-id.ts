import logger from "@clansocket/logger";
import { EXT_JSON } from "../../../shared/http/http-mime.js";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

function entryHasId(full: string, id: string): boolean {
    try {
        const raw = readFileSync(full, "utf-8");
        const parsed = JSON.parse(raw) as { id?: string };
        return parsed.id === id;
    } catch (err) {
        logger.warn(`[memory-store] paths walk skipped ${full}: ${(err as Error).message}`);
        return false;
    }
}

export function walkHasId(dir: string, id: string): boolean {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            if (walkHasId(full, id)) return true;
        } else if (entry.name.endsWith(EXT_JSON) && entryHasId(full, id)) {
            return true;
        }
    }
    return false;
}
