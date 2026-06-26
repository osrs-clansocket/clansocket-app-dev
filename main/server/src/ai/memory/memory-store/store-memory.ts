import logger from "@clansocket/logger";
import { EXT_JSON } from "../../../shared/http/http-mime.js";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { create, remove, update } from "./crud.js";
import { MEMORY_DIR, ensureDir } from "./paths.js";
import { failResult } from "./result-builders.js";
import type { MemoryFile, MemoryOp, MemoryResult } from "./types.js";
import { readExisting, validateOp } from "./validate.js";

const ACTION_DISPATCH: Record<string, (op: MemoryOp) => MemoryResult> = {
    create,
    update,
    delete: remove,
};

export const memoryStore = {
    dir: MEMORY_DIR,

    list(): MemoryFile[] {
        ensureDir();
        const files: MemoryFile[] = [];
        for (const entry of readdirSync(MEMORY_DIR)) {
            if (!entry.endsWith(EXT_JSON)) continue;
            try {
                files.push(JSON.parse(readFileSync(join(MEMORY_DIR, entry), "utf-8")) as MemoryFile);
            } catch (err) {
                logger.warn(`[memory-store] skipped malformed file ${entry}: ${(err as Error).message}`);
            }
        }
        return files;
    },

    get(id: string): MemoryFile | undefined {
        ensureDir();
        return readExisting(id);
    },

    apply(op: MemoryOp): MemoryResult {
        ensureDir();
        const violation = validateOp(op);
        if (violation) return failResult(op, violation);
        const handler = ACTION_DISPATCH[op.action];
        return handler ? handler(op) : failResult(op, `unknown action "${op.action}"`);
    },
};
