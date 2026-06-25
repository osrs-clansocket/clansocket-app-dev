import { findAutoHook } from "../../../database/discord/auto-hooks/get-by-id.js";
import type { AutoHookRow } from "../../../database/discord/auto-hooks/list.js";
import type { RoutedServerRow } from "../../../database/discord/types.js";
import { renderAutoHook } from "../../body-renderers/render-auto-hook.js";
import { renderContext } from "../../body-renderers/renderer-types.js";
import { getSamplePayload, SAMPLE_RSN } from "../../body-renderers/sample-payloads.js";

const TEST_PREFIX = "[TEST] ";
const SAMPLE_COMBAT_LEVEL = 126;
const SAMPLE_TOTAL_LEVEL = 2277;
const SAMPLE_CLAN_MEMBER_COUNT = 47;

export { TEST_PREFIX };

export interface TestSendBody {
    userId: string;
    autoHookId: string | null;
    autoHookName: string;
    triggerType: string;
    webhookId: string;
    contentTemplate: string | null;
    useEmbed: boolean;
    embedTemplateJson: string | null;
    conditionsJson: string | null;
    webhookUsernameOverride: string | null;
    webhookAvatarUrlOverride: string | null;
}

export function buildDraftRow(guildId: string, body: TestSendBody, webhookId: string): AutoHookRow {
    return {
        auto_hook_id: "test-send",
        auto_hook_name: TEST_PREFIX + body.autoHookName,
        guild_id: guildId,
        trigger_type: body.triggerType,
        webhook_id: webhookId,
        content_template: body.contentTemplate,
        use_embed: body.useEmbed ? 1 : 0,
        embed_template_json: body.embedTemplateJson,
        conditions_json: body.conditionsJson,
        enabled: 1,
        webhook_username_override: body.webhookUsernameOverride,
        webhook_avatar_url_override: body.webhookAvatarUrlOverride,
        created_by_account_id: body.userId,
        created_by_account_name: null,
        created_at: Date.now(),
        updated_at: Date.now(),
    };
}

export function pickWebhookId(clanId: string, guildId: string, body: TestSendBody): string {
    if (body.autoHookId !== null && body.autoHookId.length > 0) {
        const row = findAutoHook(clanId, guildId, body.autoHookId);
        if (row !== null) return row.webhook_id;
    }
    return body.webhookId;
}

export function buildSampleEnvelope(triggerType: string): object {
    return {
        ...getSamplePayload(triggerType),
        accountType: "ironman",
        combatLevel: SAMPLE_COMBAT_LEVEL,
        totalLevel: SAMPLE_TOTAL_LEVEL,
        clanMemberCount: SAMPLE_CLAN_MEMBER_COUNT,
        eventReceivedAt: Date.now(),
    };
}

export function renderEnvelope(
    server: RoutedServerRow,
    body: TestSendBody,
    guildId: string,
    effectiveWebhookId: string,
): ReturnType<typeof renderAutoHook> {
    const draft = buildDraftRow(guildId, body, effectiveWebhookId);
    const samplePayload = buildSampleEnvelope(body.triggerType);
    return renderAutoHook(draft, samplePayload, renderContext(SAMPLE_RSN, server.clan_name ?? null, server.bot_id));
}
