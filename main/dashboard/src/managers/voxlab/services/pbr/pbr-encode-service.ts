import PbrEncodeWorker from "../../workers/pbr-encode.worker.ts?worker";
import type { ChannelJob, PbrEncodeJob, PbrEncodeResult } from "../../workers/pbr-encode.worker.js";

export interface PbrEncodeRequest {
    slot: string;
    data: Uint8ClampedArray;
    width: number;
    height: number;
}

export class PbrEncodeService {
    private worker: Worker | null = null;
    private nextId = 1;
    private readonly pendingResolvers = new Map<number, (r: PbrEncodeResult) => void>();

    private handleMessage = (e: MessageEvent<PbrEncodeResult>): void => {
        const resolve = this.pendingResolvers.get(e.data.id);
        if (resolve === undefined) return;
        this.pendingResolvers.delete(e.data.id);
        resolve(e.data);
    };

    private ensureWorker(): Worker {
        if (this.worker !== null) return this.worker;
        const w = new PbrEncodeWorker();
        w.onmessage = this.handleMessage;
        this.worker = w;
        return w;
    }

    encodeBatch(channels: PbrEncodeRequest[]): Promise<Record<string, string>> {
        const worker = this.ensureWorker();
        const id = this.nextId;
        this.nextId++;
        const transfer: ArrayBuffer[] = [];
        const jobChannels: ChannelJob[] = channels.map((ch): ChannelJob => {
            const copy = new Uint8ClampedArray(new ArrayBuffer(ch.data.byteLength));
            copy.set(ch.data);
            transfer.push(copy.buffer);
            return { slot: ch.slot, data: copy, width: ch.width, height: ch.height };
        });
        const job: PbrEncodeJob = { id, channels: jobChannels };
        return new Promise<Record<string, string>>((resolve, reject) => {
            this.pendingResolvers.set(id, (r) => {
                if (r.ok) {
                    const map: Record<string, string> = {};
                    for (const { slot, dataURL } of r.results) map[slot] = dataURL;
                    resolve(map);
                } else {
                    reject(new Error(r.error));
                }
            });
            worker.postMessage(job, transfer);
        });
    }

    dispose(): void {
        if (this.worker !== null) {
            this.worker.terminate();
            this.worker = null;
        }
        this.pendingResolvers.clear();
    }
}
