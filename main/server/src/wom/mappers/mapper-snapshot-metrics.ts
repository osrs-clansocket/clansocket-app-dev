import { mapMetrics, type WomActivityMetric, type WomBossMetric } from "./metric-types.js";
import type { MappedSnapshotActivity, MappedSnapshotBoss } from "./snapshot-types.js";

export function mapBosses(bosses: Record<string, WomBossMetric> | undefined): MappedSnapshotBoss[] {
    return mapMetrics(bosses, (slug, m) => {
        if (typeof m.kills !== "number" || m.kills <= 0) return null;
        const sourceName = slug
            .split("_")
            .filter((p) => p.length > 0)
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join(" ");
        return { slug, sourceName, kc: m.kills };
    });
}

export function mapActivities(activities: Record<string, WomActivityMetric> | undefined): MappedSnapshotActivity[] {
    return mapMetrics(activities, (activityName, m) =>
        typeof m.score === "number" && m.score >= 0 ? { activityName, score: m.score } : null,
    );
}
