const MSAA_SAMPLES_HIGH = 8;
const MSAA_SAMPLES_MID = 4;
const SUPERSAMPLE_MAX = 3;

export function clampSamples(samples: number): number {
    if (!Number.isFinite(samples) || samples <= 0) return 0;
    if (samples >= MSAA_SAMPLES_HIGH) return MSAA_SAMPLES_HIGH;
    if (samples >= MSAA_SAMPLES_MID) return MSAA_SAMPLES_MID;
    return 2;
}

export function clampSupersample(value: number): number {
    if (!Number.isFinite(value) || value <= 0) return 1;
    return Math.min(SUPERSAMPLE_MAX, Math.max(1, value));
}
