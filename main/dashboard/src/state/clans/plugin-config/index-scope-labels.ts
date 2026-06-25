import type { PluginConfigMember, PluginConfigState } from "./client.js";
import { GLOBAL_TITLE_TEXT, type Scope } from "../../../shared/constants/plugin-config/scope-constants.js";

const RSN_LIST_INLINE_MAX = 3;

export function scopeTitle(scope: Scope, members: readonly PluginConfigMember[]): string {
    if (scope.kind === "global") return GLOBAL_TITLE_TEXT;
    if (scope.set.size === 0) return GLOBAL_TITLE_TEXT;
    const rsns: string[] = [];
    for (const m of members) if (scope.set.has(m.accountHash)) rsns.push(m.rsn);
    if (rsns.length === 0) return `${scope.set.size} members`;
    if (rsns.length === 1) return rsns[0]!;
    if (rsns.length <= RSN_LIST_INLINE_MAX) return rsns.join(", ");
    return `${rsns[0]} + ${rsns.length - 1} others`;
}

function actionLabel(scope: Scope, globalText: string, singleText: string, multiText: (n: number) => string): string {
    if (scope.kind === "global") return globalText;
    if (scope.set.size === 1) return singleText;
    return multiText(scope.set.size);
}

export function publishLabel(scope: Scope): string {
    return actionLabel(scope, "Publish to clan", "Publish member override", (n) => `Publish to ${n} members`);
}

export function clearLabel(scope: Scope): string {
    return actionLabel(scope, "Clear global preset", "Clear member override", (n) => `Clear ${n} overrides`);
}

export function metaText(scope: Scope, cfg: PluginConfigState | null): string {
    if (!cfg) return "";
    if (scope.kind === "global") {
        const g = cfg.global;
        return g ? `Last published ${new Date(g.updatedAt).toLocaleString()}` : "No global preset published yet.";
    }
    if (scope.set.size === 1) {
        const [hash] = scope.set;
        const override = cfg.overrides.find((o) => o.accountHash === hash);
        return override
            ? `Override last published ${new Date(override.updatedAt).toLocaleString()}`
            : "No override yet — inherits global.";
    }
    return `Editing override for ${scope.set.size} members.`;
}
