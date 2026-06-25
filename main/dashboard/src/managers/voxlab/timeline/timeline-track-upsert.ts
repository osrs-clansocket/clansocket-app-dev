import type { TrackLike } from "./timeline-track-types.js";

interface KfLike {
    t: number;
    v: unknown;
    presetId?: string;
}

interface UpsertAtArgs<K extends KfLike> {
    keyframes: K[];
    tAbs: number;
    epsilon: number;
    update: (existing: K) => void;
    create: () => K;
}

function upsertAt<K extends KfLike>(args: UpsertAtArgs<K>): void {
    const { keyframes, tAbs, epsilon, update, create } = args;
    const existingIdx = keyframes.findIndex((k) => Math.abs(k.t - tAbs) < epsilon);
    if (existingIdx >= 0) {
        update(keyframes[existingIdx]);
        return;
    }
    const insertAt = keyframes.findIndex((k) => k.t > tAbs);
    const newKf = create();
    if (insertAt < 0) keyframes.push(newKf);
    else keyframes.splice(insertAt, 0, newKf);
}

export function upsertKeyframe(args: {
    track: TrackLike;
    tAbs: number;
    value: unknown;
    presetId: string;
    epsilon: number;
}): void {
    const { track, tAbs, value, presetId, epsilon } = args;
    upsertAt({
        keyframes: track.keyframes,
        update: (kf) => {
            kf.v = value;
            kf.presetId = presetId;
        },
        create: () => ({ t: tAbs, v: value, presetId }),
        tAbs,
        epsilon,
    });
}

export function upsertSimpleKeyframe(
    track: { keyframes: { t: number; v: unknown }[] },
    timeMs: number,
    value: unknown,
): void {
    upsertAt({
        keyframes: track.keyframes,
        tAbs: timeMs,
        epsilon: 0.5,
        update: (kf) => {
            kf.v = value;
        },
        create: () => ({ t: timeMs, v: value }),
    });
}
