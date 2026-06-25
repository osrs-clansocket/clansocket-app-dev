import type { AutoHookRow } from "../client.js";
import { parseConditions } from "../../../../dom/pages/clans/manage/discord/modes/auto-hooks/condition-editor.js";
import { parseEmbedTemplate } from "./card-embed.js";
import { setPreviewState } from "../../../../dom/pages/clans/manage/discord/modes/auto-hooks/preview/preview-state.js";
import type { CardBodyState } from "../../../../dom/pages/clans/manage/discord/modes/auto-hooks/card/card-body.js";
import type { TestStateView } from "../../../../dom/pages/clans/manage/discord/modes/auto-hooks/card/card-test.js";

export interface CardState extends CardBodyState, TestStateView {}

export function publishPreview(state: CardState): void {
    setPreviewState({
        name: state.name,
        triggerType: state.triggerType,
        content: state.contentTemplate,
        useEmbed: state.useEmbed,
        embedTitle: state.embed.title,
        embedDescription: state.embed.description,
        embedColor: state.embed.color,
        embedUrl: state.embed.url,
        embedAuthorName: state.embed.authorName,
        embedAuthorIconUrl: state.embed.authorIconUrl,
        embedFooterText: state.embed.footerText,
        embedFooterIconUrl: state.embed.footerIconUrl,
        embedThumbnailUrl: state.embed.thumbnailUrl,
        embedImageUrl: state.embed.imageUrl,
    });
}

export function freshCardState(row: AutoHookRow): CardState {
    return {
        name: row.auto_hook_name,
        triggerType: row.trigger_type,
        webhookId: row.webhook_id,
        contentTemplate: row.content_template ?? "",
        useEmbed: row.use_embed === 1,
        embed: parseEmbedTemplate(row.embed_template_json),
        conditions: parseConditions(row.conditions_json),
        webhookUsernameOverride: row.webhook_username_override,
        webhookAvatarUrlOverride: row.webhook_avatar_url_override,
    };
}
