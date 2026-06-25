export type JsonKind = "mesh" | "snapshot" | "timeline" | "unknown";

export interface JsonSniffResult {
    kind: JsonKind;
    parsed: unknown;
}

export function sniffJsonKind(jsonText: string): JsonSniffResult {
    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonText);
    } catch {
        return { kind: "unknown", parsed: null };
    }
    return { kind: detectJsonKind(parsed), parsed };
}

function isMeshJson(v: Record<string, unknown>): boolean {
    return Array.isArray(v.positions) && Array.isArray(v.indices) && typeof v.metadata === "object";
}

function isTimelineJson(v: Record<string, unknown>): boolean {
    return typeof v.schemaVersion === "number" && Array.isArray(v.tracks) && typeof v.initialSnapshot === "object";
}

function isSnapshotJson(v: Record<string, unknown>): boolean {
    return typeof v.schemaVersion === "number" && (isObject(v.parts) || isObject(v.sections));
}

export function detectJsonKind(value: unknown): JsonKind {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return "unknown";
    const v = value as Record<string, unknown>;
    if (isMeshJson(v)) return "mesh";
    if (isTimelineJson(v)) return "timeline";
    if (isSnapshotJson(v)) return "snapshot";
    return "unknown";
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
