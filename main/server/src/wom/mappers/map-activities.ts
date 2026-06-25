import { mapMetrics, type WomActivityMetric } from "./metric-types.js";

export interface MappedActivityRow {
    activityName: string;
    score: number;
}

export function mapActivitiesMap(activities: Record<string, WomActivityMetric> | undefined): MappedActivityRow[] {
    return mapMetrics(activities, (activityName, m) =>
        typeof m.score === "number" ? { activityName, score: m.score } : null,
    );
}
