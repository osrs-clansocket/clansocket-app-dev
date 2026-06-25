export interface RowSummary {
    primary: string;
    secondary: string;
    meta: string;
}

export interface RowSummaryOpts {
    table: string;
    row: Record<string, unknown>;
    pkCols: readonly string[];
    tsCol: string | null;
    secretColumns: readonly string[];
}
