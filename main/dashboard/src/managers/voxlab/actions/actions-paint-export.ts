import { meshAsJson } from "../../../voxlab/formatters/mesh-formatter.js";
import type { ActionsCtx } from "./actions-ctx.js";
import { exportStem } from "./actions-ctx.js";

export function runPaintExport(ctx: ActionsCtx): void {
    const meshData = ctx.meshes.exportPaintedMesh();
    if (!meshData) return;
    const json = meshAsJson(meshData);
    const blob = new Blob([json], { type: "application/json" });
    ctx.fileService.saveBlob(blob, `${exportStem()}-painted.json`);
}
