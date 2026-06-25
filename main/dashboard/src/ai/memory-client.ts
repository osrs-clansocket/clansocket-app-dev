import { identityClient } from "../state/identity/identity-client/index.js";
import { okOrThrow } from "../state/fetch-result.js";

type MemoryFileType = "system" | "schema" | "context" | "mode" | "template";

interface MemoryFile {
    id: string;
    type: MemoryFileType;
    priority: number;
    always_load: boolean;
    triggers: string[];
    depends_on: string[];
    placeholders: string[];
    content: string;
}

interface MemoryResult {
    action: "create" | "update" | "delete";
    id: string;
    ok: boolean;
    error?: string;
    pinned?: boolean;
}

type WriteMethod = "POST" | "PUT" | "DELETE";

const BASE = "/api/ai/memory";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await identityClient.authedFetch(`${BASE}${path}`, init);
    return okOrThrow<T>(res, "HTTP");
}

function writeInit(method: WriteMethod, payload: Record<string, unknown>): RequestInit {
    return {
        method,
        body: JSON.stringify(payload),
    };
}

function writeOp(method: WriteMethod, id: string | null, payload: Record<string, unknown>): Promise<MemoryResult> {
    const path = id === null ? "/" : `/${encodeURIComponent(id)}`;
    return request<MemoryResult>(path, writeInit(method, payload));
}

const memoryClient = {
    async list(): Promise<MemoryFile[]> {
        const body = await request<{ files: MemoryFile[] }>("");
        return body.files;
    },

    async get(id: string): Promise<MemoryFile> {
        return request<MemoryFile>(`/${encodeURIComponent(id)}`);
    },

    create(
        file: Omit<MemoryFile, "depends_on" | "placeholders"> & { depends_on?: string[]; placeholders?: string[] },
    ): Promise<MemoryResult> {
        return writeOp("POST", null, { ...file });
    },

    update(id: string, file: Partial<MemoryFile>): Promise<MemoryResult> {
        return writeOp("PUT", id, { ...file });
    },

    deleteById(id: string): Promise<MemoryResult> {
        return writeOp("DELETE", id, {});
    },
} as const;

export type { MemoryFile, MemoryResult };
export { memoryClient };
