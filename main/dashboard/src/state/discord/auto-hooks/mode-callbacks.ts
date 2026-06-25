import { deleteAutoHook, toggleAutoHook, updateAutoHook, type AutoHookRow } from "./client.js";
import { identityStore } from "../../identity/stores/identity-store.js";

function updatePayload(
    session: { id: string; displayName: string | null },
    next: AutoHookRow,
): Parameters<typeof updateAutoHook>[2] {
    return {
        userId: session.id,
        userName: session.displayName,
        autoHookName: next.auto_hook_name,
        triggerType: next.trigger_type,
        webhookId: next.webhook_id,
        contentTemplate: next.content_template,
        useEmbed: next.use_embed === 1,
        embedTemplateJson: next.embed_template_json,
        conditionsJson: next.conditions_json,
        enabled: next.enabled === 1,
        webhookUsernameOverride: next.webhook_username_override,
        webhookAvatarUrlOverride: next.webhook_avatar_url_override,
    };
}

async function callOnSave(guildId: string, next: AutoHookRow, refetch: () => Promise<void>): Promise<void> {
    const session = identityStore.session$();
    if (session === null) return;
    await updateAutoHook(guildId, next.auto_hook_id, updatePayload(session, next));
    await refetch();
}

interface CallToggleArgs {
    guildId: string;
    id: string;
    enabled: boolean;
    nameFor: (id: string) => string;
    refetch: () => Promise<void>;
}

async function callOnToggle(args: CallToggleArgs): Promise<void> {
    const { guildId, id, enabled, nameFor, refetch } = args;
    const session = identityStore.session$();
    if (session === null) return;
    await toggleAutoHook(guildId, id, { enabled, userId: session.id, autoHookName: nameFor(id) });
    await refetch();
}

async function callOnDelete(
    guildId: string,
    id: string,
    nameFor: (id: string) => string,
    refetch: () => Promise<void>,
): Promise<void> {
    const session = identityStore.session$();
    if (session === null) return;
    await deleteAutoHook(guildId, id, { userId: session.id, autoHookName: nameFor(id) });
    await refetch();
}

export function buildCallbacks(
    guildId: string,
    autoHooks: AutoHookRow[],
    refetch: () => Promise<void>,
): {
    onSave: (next: AutoHookRow) => Promise<void>;
    onToggle: (id: string, enabled: boolean) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
} {
    const nameFor = (id: string): string => autoHooks.find((r) => r.auto_hook_id === id)?.auto_hook_name ?? id;
    return {
        onSave: (next) => callOnSave(guildId, next, refetch),
        onToggle: (id, enabled) => callOnToggle({ guildId, id, enabled, nameFor, refetch }),
        onDelete: (id) => callOnDelete(guildId, id, nameFor, refetch),
    };
}
