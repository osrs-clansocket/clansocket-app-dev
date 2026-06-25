import { drainQueue } from "../shared/queue-drainer.js";

export abstract class BaseQueueRunner<TRow, TReg, TResult> {
    protected abstract claim(row: TRow): Promise<boolean>;

    protected abstract lookupRegistration(row: TRow): TReg | null;

    protected abstract gate(row: TRow, reg: TReg): Promise<boolean>;

    protected abstract runHandler(row: TRow, reg: TReg): Promise<TResult>;

    protected abstract markApplied(row: TRow, result: TResult): Promise<void>;

    protected abstract markFailed(row: TRow, err: unknown): Promise<void>;

    protected abstract markUnhandled(row: TRow): Promise<void>;

    async run(row: TRow): Promise<void> {
        if (!(await this.claim(row))) return;
        const reg = this.lookupRegistration(row);
        if (!reg) {
            await this.markUnhandled(row);
            return;
        }
        if (!(await this.gate(row, reg))) return;
        try {
            const result = await this.runHandler(row, reg);
            await this.markApplied(row, result);
        } catch (err) {
            await this.markFailed(row, err);
        }
    }

    drainAll(rows: TRow[]): Promise<number> {
        return drainQueue(rows, (row) => this.run(row));
    }
}

export async function loadAndDrain<TRow>(
    load: () => Promise<TRow[]>,
    runner: BaseQueueRunner<TRow, unknown, unknown>,
): Promise<number> {
    return runner.drainAll(await load());
}
