export interface TableSummary {
    primary: string;
    secondary: string;
    updated: string;
}

export interface TableMeta {
    label: string;
    icon: string;
    assetPath?: string;
    summary?: TableSummary;
}

export function entry(label: string, icon: string, fields?: readonly string[], assetPath?: string): TableMeta {
    const base: TableMeta = { label, icon };
    if (assetPath !== undefined) base.assetPath = assetPath;
    if (!fields || fields.length === 0) return base;
    base.summary = { primary: fields[0], secondary: fields[1] ?? "", updated: fields[2] ?? "" };
    return base;
}
