import gifWorkerUrl from "gif.js/dist/gif.worker.js?url";
import type { BakeRequest } from "../../../dom/forms/voxlab/panels/export-panel-component.js";
import { modalService } from "../services/modal-service.js";
import type { ActionsCtx } from "./actions-ctx.js";
import { exportStem } from "./actions-ctx.js";

export async function runBake(ctx: ActionsCtx, req: BakeRequest): Promise<void> {
    if (!ctx.timeline.hasTimeline()) {
        void modalService.alert("Load a timeline JSON before baking an animation.");
        return;
    }
    await ctx.overlays.showBusy("Baking animation…");
    try {
        const size = Math.max(req.width, req.height);
        const result = await ctx.baker.bakeAnimation({
            format: req.format,
            width: size,
            height: size,
            fps: req.fps,
            durationMs: ctx.timeline.durationMs,
            transparent: true,
            gifWorkerScript: gifWorkerUrl,
        });
        ctx.fileService.saveBlob(result.blob, `${exportStem()}.${result.suggestedExtension}`);
    } catch (err) {
        void modalService.alert(`Bake failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
        ctx.overlays.hideBusy();
    }
}
