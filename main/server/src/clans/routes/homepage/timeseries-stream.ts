import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { ERROR_CLAN_NOT_FOUND } from "../../../shared/error-reasons.js";
import { HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import { clanBySlug } from "../../../database/index.js";
import { subscribeProjection } from "../../../data-rights/streams/subscriber-projection.js";
import { timeseriesTopic } from "../../../data-rights/streams/topics/timeseries-topic.js";
import { bindStreamLifecycle, openEventStream, writeSseFrame } from "../../../shared/http/sse-stream.js";
import { mountedRouter } from "../_mount-registry.js";

const router = mountedRouter();

(() => {
    router.get("/:slug/timeseries/stream", (req: Request, res: Response): void => {
        const slug = String(req.params.slug ?? "").toLowerCase();
        const clan = clanBySlug(slug);
        if (!clan || clan.archived_at !== null) {
            res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
            return;
        }
        const clanId = clan.id;
        openEventStream(res);
        const topic = timeseriesTopic(clanId);
        const handle = subscribeProjection(`clan_timeseries:${clanId}`, topic, (batch) => {
            logger.debug(`[timeseries.stream] clan=${clanId} delta seq=${batch.toSeq} rows=${batch.deltas.length}`);
            writeSseFrame(res, batch, dispose);
        });
        function dispose(): void {
            logger.debug(`[timeseries.stream] clan=${clanId} dispose`);
            handle.unsubscribe();
        }
        logger.debug(`[timeseries.stream] clan=${clanId} open baseline_rows=${handle.baseline.rows.length}`);
        writeSseFrame(res, { snapshot: handle.baseline }, dispose);
        bindStreamLifecycle(req, dispose);
    });
})();

export default router;
