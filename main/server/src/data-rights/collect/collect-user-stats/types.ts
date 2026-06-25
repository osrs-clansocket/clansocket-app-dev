export interface UserDataStats {
    totalRows: number;
    totalBytes: number;
    totalDbs: number;
    firstEntryAt: number | null;
}

export interface TableStat {
    rows: number;
    bytes: number;
    minTs: number | null;
}

export function tableStat(rows: number, bytes: number, minTs: number | null = null): TableStat {
    return { rows, bytes, minTs };
}

export const ZERO: TableStat = tableStat(0, 0);
