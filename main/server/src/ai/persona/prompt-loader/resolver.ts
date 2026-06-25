import { callDynamic, hasDynamic } from "./dynamic-registry.js";
import { getPromptFile, listPromptFiles } from "./registry.js";
import type { DynamicContext, PromptFile } from "./types.js";

export { fillPlaceholders } from "./schema-formatter.js";

function resolveDynamic(file: PromptFile, ctx: DynamicContext): PromptFile {
    if (hasDynamic(file.id)) {
        return { ...file, content: callDynamic(file.id, ctx) };
    }
    return file;
}

function addWithDeps(file: PromptFile, result: PromptFile[], loaded: Set<string>, ctx: DynamicContext): void {
    if (loaded.has(file.id)) return;
    for (const depId of file.depends_on) {
        const dep = getPromptFile(depId);
        if (dep && !loaded.has(depId)) addWithDeps(dep, result, loaded, ctx);
    }
    loaded.add(file.id);
    result.push(resolveDynamic(file, ctx));
}

function addAutoSchemas(mode: PromptFile, result: PromptFile[], loaded: Set<string>, ctx: DynamicContext): void {
    if (!mode.auto_load_schemas) return;
    for (const schemaId of mode.auto_load_schemas) {
        const schema = getPromptFile(schemaId);
        if (schema) addWithDeps(schema, result, loaded, ctx);
    }
}

function buildResolved(seed: (result: PromptFile[], loaded: Set<string>) => void): PromptFile[] {
    const result: PromptFile[] = [];
    const loaded = new Set<string>();
    seed(result, loaded);
    result.sort((a, b) => a.priority - b.priority);
    return result;
}

export function getOne(id: string, ctx: DynamicContext): PromptFile | null {
    const file = getPromptFile(id) ?? null;
    if (file && hasDynamic(id)) {
        file.content = callDynamic(id, ctx);
    }
    return file;
}

export function resolveForMode(modeId: string, ctx: DynamicContext): PromptFile[] {
    return buildResolved((result, loaded) => {
        for (const file of listPromptFiles()) {
            if (file.always_load) addWithDeps(file, result, loaded, ctx);
        }
        const mode = getPromptFile(modeId);
        if (mode) {
            addWithDeps(mode, result, loaded, ctx);
            addAutoSchemas(mode, result, loaded, ctx);
        }
    });
}

export function resolveByIds(ids: string[], ctx: DynamicContext): PromptFile[] {
    return buildResolved((result, loaded) => {
        for (const id of ids) {
            const file = getPromptFile(id);
            if (file) addWithDeps(file, result, loaded, ctx);
        }
    });
}

export function readableIndex(): { id: string; type: string; preview: string }[] {
    return Array.from(listPromptFiles())
        .filter((f) => !f.always_load)
        .map((f) => {
            const preview = hasDynamic(f.id)
                ? `(dynamic — read: ["${f.id}"] to load live content)`
                : f.content.slice(0, 80).split("\n").join(" ");
            return {
                id: f.id,
                type: f.type,
                preview,
            };
        });
}
