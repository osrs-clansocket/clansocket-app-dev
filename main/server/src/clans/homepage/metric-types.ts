export type MetricCategory = "combat" | "skills" | "loot" | "items" | "collection" | "activity";

export type MetricFormat = "int" | "gp";

export type MetricAggregation = "SUM" | "MAX" | "COUNT" | "COUNT_DISTINCT";

export interface MetricSpec {
    readonly key: string;
    readonly label: string;
    readonly category: MetricCategory;
    readonly format: MetricFormat;
    readonly sql: string;
}

export interface MetricRow {
    readonly variable_key: string;
    readonly value: number;
    readonly format: MetricFormat;
    readonly label: string;
    readonly category: MetricCategory;
}

export interface ManifestEntry {
    readonly key: string;
    readonly label: string;
    readonly category: MetricCategory;
    readonly format: MetricFormat;
}
