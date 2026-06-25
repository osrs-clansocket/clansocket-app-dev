import { existsSync, unlinkSync, writeFileSync } from "fs";
import { promptLoader } from "../../persona/prompt-loader/index.js";
import { currentCount, filePath, idExistsPrompts } from "./paths.js";
import { failResult } from "./result-builders.js";
import { MAX_FILES, type MemoryOp, type MemoryResult } from "./types.js";
import { buildFile, readExisting } from "./validate.js";

export function create(op: MemoryOp): MemoryResult {
    if (existsSync(filePath(op.id))) {
        return failResult(op, `id "${op.id}" already exists — use update instead`);
    }
    if (idExistsPrompts(op.id)) {
        return failResult(op, `id "${op.id}" collides with a system prompt — pick a different id`);
    }
    if (currentCount() >= MAX_FILES) {
        return failResult(op, `memory cap (${MAX_FILES}) reached — delete old entries first`);
    }
    const file = buildFile(op);
    writeFileSync(filePath(op.id), JSON.stringify(file, null, 2), "utf-8");
    promptLoader.reloadFile(op.id);
    return { action: op.action, id: op.id, ok: true, pinned: true, after: file.content };
}

export function update(op: MemoryOp): MemoryResult {
    const existing = readExisting(op.id);
    if (!existing) {
        return failResult(op, `id "${op.id}" does not exist — use create instead`);
    }
    const file = buildFile(op, existing);
    writeFileSync(filePath(op.id), JSON.stringify(file, null, 2), "utf-8");
    promptLoader.reloadFile(op.id);
    return { action: op.action, id: op.id, ok: true, before: existing.content, after: file.content };
}

export function remove(op: MemoryOp): MemoryResult {
    const p = filePath(op.id);
    if (!existsSync(p)) {
        return failResult(op, `id "${op.id}" does not exist`);
    }
    const existing = readExisting(op.id);
    unlinkSync(p);
    promptLoader.reloadFile(op.id);
    return { action: op.action, id: op.id, ok: true, before: existing?.content ?? "" };
}
