import { isObject } from "./timeline-migration-types.js";

const CAMERA_TRACK_REWRITES: Record<string, string> = {
    "camera.position.x": "camera.positionX",
    "camera.position.y": "camera.positionY",
    "camera.position.z": "camera.positionZ",
    "camera.target.x": "camera.targetX",
    "camera.target.y": "camera.targetY",
    "camera.target.z": "camera.targetZ",
};

export function rewriteCameraTracks(tracks: unknown): unknown {
    const rewrite = (track: Record<string, unknown>): Record<string, unknown> => {
        if (typeof track.property !== "string") return track;
        const next = CAMERA_TRACK_REWRITES[track.property];
        return next ? { ...track, property: next } : track;
    };
    return Array.isArray(tracks)
        ? tracks.map((t) => (isObject(t) ? rewrite(t as Record<string, unknown>) : t))
        : tracks;
}
