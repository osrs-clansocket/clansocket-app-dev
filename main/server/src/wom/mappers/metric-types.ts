export interface WomSkillMetric {
    rank?: number;
    level?: number;
    experience?: number;
}

export interface WomBossMetric {
    rank?: number;
    kills?: number;
}

export interface WomActivityMetric {
    rank?: number;
    score?: number;
}

export function mapMetrics<M, T>(
    src: Record<string, M> | undefined,
    accept: (key: string, metric: M) => T | null,
): T[] {
    if (!src) return [];
    const out: T[] = [];
    for (const [key, metric] of Object.entries(src)) {
        const mapped = accept(key, metric);
        if (mapped !== null) out.push(mapped);
    }
    return out;
}
