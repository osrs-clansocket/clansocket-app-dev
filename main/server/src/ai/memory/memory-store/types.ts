export const MAX_FILES = 50;
export const MAX_CONTENT_BYTES = 16 * 1024;

export const ID_RULE = "lowercase letters, digits, hyphens, 2-64 chars, starting with letter/digit";
const ID_MIN_LEN = 2;
const ID_MAX_LEN = 64;

function isLowerAlnum(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "0" && c <= "9");
}

export function isMemoryId(id: string): boolean {
    if (id.length < ID_MIN_LEN || id.length > ID_MAX_LEN) return false;
    if (!isLowerAlnum(id[0])) return false;
    for (let i = 1; i < id.length; i++) {
        const c = id[i];
        if (!isLowerAlnum(c) && c !== "-") return false;
    }
    return true;
}

export type MemoryAction = "create" | "update" | "delete";

export type MemoryFileType = "system" | "schema" | "context" | "mode" | "template";

export interface MemoryFile {
    id: string;
    type: MemoryFileType;
    priority: number;
    always_load: boolean;
    triggers: string[];
    depends_on: string[];
    placeholders: string[];
    content: string;
}

export interface MemoryOp {
    action: MemoryAction;
    id: string;
    type?: MemoryFile["type"];
    priority?: number;
    always_load?: boolean;
    triggers?: string[];
    depends_on?: string[];
    placeholders?: string[];
    content?: string;
}

export interface MemoryResult {
    action: MemoryAction;
    id: string;
    ok: boolean;
    error?: string;
    pinned?: boolean;
    before?: string;
    after?: string;
}
