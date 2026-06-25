import { identityClient } from "../../identity/identity-client/index.js";
import type { ExportResult } from "./export-types.js";
import { readExport } from "./export-readers.js";
import { withResponse } from "./export-response.js";

export async function exportClanData(slug: string): Promise<ExportResult> {
    const res = await identityClient.authedFetch(`/api/data-rights/clan/${encodeURIComponent(slug)}/export`, {
        method: "GET",
    });
    return withResponse(res, async () => {
        const exp = await readExport(res, `clansocket-clan-${slug}.zip`);
        return { ok: true, ...exp } as const;
    });
}
