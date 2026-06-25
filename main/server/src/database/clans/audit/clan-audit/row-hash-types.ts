export interface HashableRow {
    ts: number;
    actor: string | null;
    action: string;
    source: string;
    schemaVersion: number;
    targetType: string | null;
    targetId: string | null;
    payloadJson: string | null;
    prevHash: string | null;
}
