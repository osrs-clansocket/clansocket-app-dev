import { snapshot, type Instance } from "../../../factory";
import type { dataRightsClient } from "../../../../state/data-rights/data-rights-client/index.js";
import { formatCooldown } from "./format.js";
import { triggerDownload } from "./action-download.js";

export function reportExportResult(args: {
    result: Awaited<ReturnType<typeof dataRightsClient.exportSelfData>>;
    status: Instance;
}): void {
    const { result, status } = args;
    if (result.ok) {
        triggerDownload(result.blob, result.filename);
        status.setText("Download started.");
        return;
    }
    if (result.reason === "cooldown") status.setText(`Cooldown · ${formatCooldown(result.retryAfterMs)}`);
    else if (result.reason === "no_data") status.setText("No game data linked to ur account.");
    else status.setText(snapshot(result.message ?? `export failed.`));
}
