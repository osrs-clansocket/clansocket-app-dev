/// <reference lib="webworker" />
import { encodeChannel } from "./pbr-encode-channel.js";

import type { ChannelJob as _ChannelJob, PbrEncodeJob as _PbrEncodeJob } from "./encode-job-types.js";
export type ChannelJob = _ChannelJob;
export type PbrEncodeJob = _PbrEncodeJob;
import type {
    ChannelResult as _ChannelResult,
    PbrEncodeErr as _PbrEncodeErr,
    PbrEncodeOk as _PbrEncodeOk,
    PbrEncodeResult as _PbrEncodeResult,
} from "./encode-result-types.js";
export type ChannelResult = _ChannelResult;
export type PbrEncodeErr = _PbrEncodeErr;
export type PbrEncodeOk = _PbrEncodeOk;
export type PbrEncodeResult = _PbrEncodeResult;

self.onmessage = (e: MessageEvent<PbrEncodeJob>): void => {
    const { id, channels } = e.data;
    const pending: Promise<ChannelResult>[] = [];
    for (const ch of channels) pending.push(encodeChannel(ch));
    Promise.all(pending)
        .then((results): void => {
            const ok: PbrEncodeOk = { id, results, ok: true };
            (self as DedicatedWorkerGlobalScope).postMessage(ok);
        })
        .catch((err: unknown): void => {
            const message = err instanceof Error ? err.message : String(err);
            const fail: PbrEncodeErr = { id, ok: false, error: message };
            (self as DedicatedWorkerGlobalScope).postMessage(fail);
        });
};
