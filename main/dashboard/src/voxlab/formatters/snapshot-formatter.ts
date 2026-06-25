import type { SceneSnapshot } from "../../shared/types/voxlab/snapshot-types.js";

export function snapshotAsJson(snapshot: SceneSnapshot): string {
    return JSON.stringify(snapshot);
}

export function snapshotFileName(stem: string): string {
    return `${stem}.snapshot.json`;
}
