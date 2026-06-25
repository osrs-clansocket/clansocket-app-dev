import { existsSync, readFileSync } from "fs";
import { filePath } from "./paths.js";
import { ID_RULE, MAX_CONTENT_BYTES, isMemoryId, type MemoryFile, type MemoryOp } from "./types.js";

export function validateOp(op: MemoryOp): string | null {
    if (!op.id || typeof op.id !== "string") return "id must be a non-empty string";
    if (!isMemoryId(op.id)) return `id "${op.id}" invalid (${ID_RULE})`;
    if (op.action === "create" || op.action === "update") {
        if (!op.content || typeof op.content !== "string") return "content must be a non-empty string";
        if (Buffer.byteLength(op.content, "utf-8") > MAX_CONTENT_BYTES) {
            return `content exceeds ${MAX_CONTENT_BYTES} bytes`;
        }
    }
    return null;
}

const DEFAULT_MEMORY_PRIORITY = 20;

function resolvePriority(op: MemoryOp, existing?: MemoryFile): number {
    if (typeof op.priority === "number") return op.priority;
    return existing?.priority ?? DEFAULT_MEMORY_PRIORITY;
}

function pick<T>(opVal: T | undefined, existingVal: T | undefined, fallback: T): T {
    return opVal ?? existingVal ?? fallback;
}

export function buildFile(op: MemoryOp, existing?: MemoryFile): MemoryFile {
    return {
        id: op.id,
        type: pick(op.type, existing?.type, "context"),
        priority: resolvePriority(op, existing),
        always_load: pick(op.always_load, existing?.always_load, false),
        triggers: pick(op.triggers, existing?.triggers, []),
        depends_on: pick(op.depends_on, existing?.depends_on, []),
        placeholders: pick(op.placeholders, existing?.placeholders, []),
        content: pick(op.content, existing?.content, ""),
    };
}

export function readExisting(id: string): MemoryFile | undefined {
    const p = filePath(id);
    if (!existsSync(p)) return undefined;
    try {
        return JSON.parse(readFileSync(p, "utf-8")) as MemoryFile;
    } catch {
        return undefined;
    }
}
