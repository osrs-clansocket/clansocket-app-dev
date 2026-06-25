import type { Response } from "express";
import { writeSseFrame } from "../../shared/http/sse-stream.js";
import { registerIdentityListener } from "../streams/identity-stream.js";
import { subscribeProjection } from "../streams/projection.js";
import { resolveTopic } from "../streams/projection-registry.js";
import { attachWritesStream } from "./streams-writes-handler.js";
import type { ParsedSub } from "./streams-sub-parser.js";

export interface AttachArgs {
    sub: ParsedSub;
    siteAccountId: string;
    res: Response;
    cleanupAll: () => void;
}

function topicParamsOf(raw: Record<string, unknown>): Record<string, unknown> {
    return raw.params && typeof raw.params === "object" ? (raw.params as Record<string, unknown>) : {};
}

const SUB_ATTACHERS: Record<string, (args: AttachArgs) => (() => void) | null> = {
    projection: ({ sub, siteAccountId, res, cleanupAll }) => {
        const topic = sub.raw.topic as string;
        const def = resolveTopic(topic, siteAccountId, topicParamsOf(sub.raw))!;
        const handle = subscribeProjection(topic, def, (batch) =>
            writeSseFrame(res, { id: sub.id, payload: { batch } }, cleanupAll),
        );
        writeSseFrame(res, { id: sub.id, payload: { snapshot: handle.baseline } }, cleanupAll);
        return () => handle.unsubscribe();
    },
    writes: (args) => attachWritesStream(args),
    identification: ({ sub, siteAccountId, res, cleanupAll }) =>
        registerIdentityListener(siteAccountId, (event) =>
            writeSseFrame(res, { id: sub.id, payload: event }, cleanupAll),
        ),
};

export function attachOne(args: AttachArgs): (() => void) | null {
    return SUB_ATTACHERS[args.sub.kind]?.(args) ?? null;
}

export { topicParamsOf };
