export interface SchedulerCounters {
    frameMs: number;
    commitSize: number;
    queueDepth: number;
    slicedCommits: number;
}

export const counters: SchedulerCounters = { frameMs: 0, commitSize: 0, queueDepth: 0, slicedCommits: 0 };

export function getSchedulerCounters(): SchedulerCounters {
    return { ...counters };
}
