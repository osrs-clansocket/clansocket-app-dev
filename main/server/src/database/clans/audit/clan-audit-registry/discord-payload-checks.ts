import { isPlainObject, isString } from "./type-guards.js";

export function hasDiscordCore(p: Record<string, unknown>): boolean {
    return isString(p.guildId) && isString(p.targetName);
}

export function hasBeforeAfter(p: Record<string, unknown>): boolean {
    return isPlainObject(p.after) && (p.before === null || isPlainObject(p.before));
}

export function hasOverwriteTarget(p: Record<string, unknown>): boolean {
    return (
        (p.overwriteKind === "role" || p.overwriteKind === "member") &&
        isString(p.overwriteTargetId) &&
        isString(p.overwriteTargetName)
    );
}
