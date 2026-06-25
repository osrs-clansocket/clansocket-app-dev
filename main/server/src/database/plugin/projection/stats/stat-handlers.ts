import type { HandlerCtx } from "../handler-ctx.js";
import { asNumber, asNumberNullable, extractWhere } from "../projection-utils.js";
import { insertStatChange } from "./stat-changes.js";
import { normalizeSkill, readPriorStat, upsertStat } from "./stat-state.js";
import type { SkillEntry } from "./stat-types.js";

export function handleStats(ctx: HandlerCtx): void {
    const { conn, payload, now, id } = ctx;
    const skills: SkillEntry[] = Array.isArray(payload.skills) ? payload.skills : [];
    conn.transaction(() => {
        for (const entry of skills) {
            const skill = normalizeSkill(entry.name) ?? normalizeSkill(entry.skill);
            if (skill === null) continue;
            const level = asNumber(entry.level, 0);
            const boosted = asNumber(entry.boosted, level);
            const xp = asNumber(entry.xp, 0);
            upsertStat(conn, id, { skill, level, boosted, xp }, now);
        }
    })();
}

export function handleLevelUp(ctx: HandlerCtx): void {
    const { conn, payload, now, envelope, id } = ctx;
    const { accountHash } = id;
    const skill = normalizeSkill(payload.skill);
    if (skill === null) return;
    const where = extractWhere(payload);
    const levelAfter = asNumber(payload.level, 0);
    const levelBefore = asNumber(payload.levelBefore, readPriorStat(conn, accountHash, skill)?.level ?? levelAfter);
    const xpBefore = asNumber(payload.xpBefore, readPriorStat(conn, accountHash, skill)?.xp ?? 0);
    const xpGained = asNumber(payload.xpGained, 0);
    const xpAfter = xpBefore + xpGained;
    conn.transaction(() => {
        insertStatChange(conn, id, { envelope, where }, { skill, levelBefore, levelAfter, xpBefore, xpAfter });
        upsertStat(conn, id, { skill, level: levelAfter, boosted: levelAfter, xp: xpAfter }, now);
    })();
}

export function handleXpGained(ctx: HandlerCtx): void {
    const { conn, payload, now, id } = ctx;
    const skill = normalizeSkill(payload.skill);
    const xpAfter = asNumberNullable(payload.xp);
    if (skill === null || xpAfter === null) return;
    const prior = readPriorStat(conn, id.accountHash, skill);
    if (prior !== null && prior.xp === xpAfter) return;
    const level = prior?.level ?? 0;
    upsertStat(conn, id, { skill, level, boosted: level, xp: xpAfter }, now);
}
