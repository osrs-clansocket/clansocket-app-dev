import { mapMetrics, type WomSkillMetric } from "./metric-types.js";

export interface MappedSkillRow {
    skill: string;
    level: number;
    experience: number;
}

export function mapSkillsMap(skills: Record<string, WomSkillMetric> | undefined): MappedSkillRow[] {
    return mapMetrics(skills, (skill, m) =>
        typeof m.level === "number" && typeof m.experience === "number"
            ? { skill, level: m.level, experience: m.experience }
            : null,
    );
}
