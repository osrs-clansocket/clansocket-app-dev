import type { Timeline } from "../../../shared/types/voxlab/timeline-types.js";
import type { SceneSnapshot } from "../../../shared/types/voxlab/snapshot-types.js";

export function buildDraftSnapshot(timeline: Timeline, animatedParts: ReadonlySet<string>): SceneSnapshot {
    const sourceParts = timeline.initialSnapshot.parts;
    const animatedSubset: SceneSnapshot["parts"] = {};
    for (const partName of animatedParts) {
        const initialPart = sourceParts[partName];
        if (initialPart !== undefined) animatedSubset[partName] = initialPart;
    }
    return {
        schemaVersion: timeline.initialSnapshot.schemaVersion,
        capturedAt: timeline.initialSnapshot.capturedAt,
        parts: structuredClone(animatedSubset),
    };
}

export function computeAnimatedParts(timeline: Timeline | null): Set<string> {
    const out = new Set<string>();
    if (!timeline) return out;
    for (const track of timeline.tracks) {
        const dot = track.property.indexOf(".");
        if (dot > 0) out.add(track.property.slice(0, dot));
    }
    return out;
}
