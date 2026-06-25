import type { CaptureRequest } from "../../../dom/forms/voxlab/panels/export-panel-component.js";
import { modalService } from "../services/modal-service.js";
import type { ActionsCtx } from "./actions-ctx.js";
import { exportStem } from "./actions-ctx.js";

export async function runCapture(ctx: ActionsCtx, req: CaptureRequest): Promise<void> {
    await ctx.overlays.showBusy("Capturing frame…");
    try {
        const size = Math.max(req.width, req.height);
        const result = await ctx.baker.bakeFrame({ format: req.format, width: size, height: size, transparent: true });
        ctx.fileService.saveBlob(result.blob, `${exportStem()}.${result.suggestedExtension}`);
    } catch (err) {
        void modalService.alert(`Capture failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
        ctx.overlays.hideBusy();
    }
}
