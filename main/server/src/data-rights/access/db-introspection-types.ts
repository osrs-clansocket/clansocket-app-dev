export interface ColumnInfo {
    name: string;
    nameQuoted: string;
    pkOrder: number;
}

export interface TableIntrospection {
    cols: ColumnInfo[];
    pkCols: string[];
    tsCol: string | null;
}

export const TS_PROBE_COLUMNS: readonly string[] = [
    "created_at",
    "issued_at",
    "captured_at",
    "recorded_at",
    "received_at",
    "ts",
    "timestamp",
    "observed_at",
    "occurred_at",
    "first_seen_at",
    "first_seen",
    "started_at",
    "verified_at",
    "bound_at",
    "linked_at",
    "performed_at",
    "updated_at",
    "minute_bucket",
];
