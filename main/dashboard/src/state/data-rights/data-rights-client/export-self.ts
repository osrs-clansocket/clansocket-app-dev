import { identityClient } from "../../identity/identity-client/index.js";
import type { DataRightsError } from "./types.js";
import type { ExportResult } from "./export-types.js";
import { readExport } from "./export-readers.js";
import { withResponse } from "./export-response.js";

export async function exportSelfData(): Promise<ExportResult> {
    const res = await identityClient.authedFetch("/api/data-rights/me/export", { method: "GET" });
    return withResponse(res, async () => {
        const exp = await readExport(res, "clansocket-user-export.zip");
        return { ok: true, ...exp } as const;
    });
}

export async function deleteSelfData(): Promise<{ ok: true } | ({ ok: false } & DataRightsError)> {
    const res = await identityClient.authedFetch("/api/data-rights/me/delete", { method: "POST" });
    return withResponse(res, async () => ({ ok: true }) as const);
}
