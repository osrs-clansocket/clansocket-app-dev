import type { MemoryOp, MemoryResult } from "./types.js";

export function failResult(op: MemoryOp, error: string): MemoryResult {
    return { action: op.action, id: op.id, ok: false, error };
}
