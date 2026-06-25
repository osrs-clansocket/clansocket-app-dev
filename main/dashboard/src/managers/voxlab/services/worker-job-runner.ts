export interface JobMessage {
    id: number;
}

export interface JobResult {
    id: number;
}

interface PendingEntry<Result extends JobResult> {
    resolve(result: Result): void;
    reject(err: Error): void;
    cleanup(): void;
}

export interface JobRunnerOpts {
    createWorker(): Worker;
    timeoutMs: number;
    label: string;
}

export interface JobRunner<Job extends JobMessage, Result extends JobResult> {
    post(buildJob: (id: number) => Job, transfer: Transferable[], signal?: AbortSignal): Promise<Result>;
    dispose(): void;
}

class JobRunnerImpl<Job extends JobMessage, Result extends JobResult> implements JobRunner<Job, Result> {
    private worker: Worker | null = null;
    private nextId = 1;
    private readonly tracked = new Map<number, PendingEntry<Result>>();

    constructor(private readonly opts: JobRunnerOpts) {}

    post(buildJob: (id: number) => Job, transfer: Transferable[], signal?: AbortSignal): Promise<Result> {
        return new Promise<Result>((resolve, reject) => {
            if (signal?.aborted) {
                reject(new DOMException("Aborted", "AbortError"));
                return;
            }
            const id = this.nextId;
            this.nextId += 1;
            this.attach(id, resolve, reject, signal);
            this.ensureWorker().postMessage(buildJob(id), transfer);
        });
    }

    dispose(): void {
        for (const entry of this.tracked.values()) {
            entry.cleanup();
            entry.reject(new Error("worker disposed"));
        }
        this.tracked.clear();
        if (this.worker !== null) {
            this.worker.terminate();
            this.worker = null;
        }
    }

    private attach(
        id: number,
        resolve: (r: Result) => void,
        reject: (e: Error) => void,
        signal: AbortSignal | undefined,
    ): void {
        const fail = (err: Error): void => this.failPending(id, err, reject);
        const onAbort = (): void => fail(new DOMException("Aborted", "AbortError"));
        const timeoutId = window.setTimeout(
            () => fail(new Error(`${this.opts.label} worker timeout`)),
            this.opts.timeoutMs,
        );
        const cleanup = (): void => {
            signal?.removeEventListener("abort", onAbort);
            clearTimeout(timeoutId);
        };
        signal?.addEventListener("abort", onAbort, { once: true });
        this.tracked.set(id, { resolve, reject, cleanup });
    }

    private failPending(id: number, err: Error, reject: (e: Error) => void): void {
        const entry = this.tracked.get(id);
        if (entry === undefined) return;
        this.tracked.delete(id);
        entry.cleanup();
        reject(err);
    }

    private handleMessage(e: MessageEvent<Result>): void {
        const entry = this.tracked.get(e.data.id);
        if (entry === undefined) return;
        this.tracked.delete(e.data.id);
        entry.cleanup();
        entry.resolve(e.data);
    }

    private ensureWorker(): Worker {
        if (this.worker !== null) return this.worker;
        const w = this.opts.createWorker();
        w.onmessage = (e) => this.handleMessage(e as MessageEvent<Result>);
        this.worker = w;
        return w;
    }
}

export function jobRunner<Job extends JobMessage, Result extends JobResult>(
    opts: JobRunnerOpts,
): JobRunner<Job, Result> {
    return new JobRunnerImpl<Job, Result>(opts);
}
