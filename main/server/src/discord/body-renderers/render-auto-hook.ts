import type { AutoHookRow } from "../../database/discord/auto-hooks/list.js";
import { isPlainObject } from "../../shared/validators/type-guards.js";
import { buildWebhookEnvelope, type WebhookEnvelope } from "./envelope/webhook-envelope.js";
import { renderTemplate, type TokenSource } from "./render-template.js";
import { pickRenderer } from "./renderer-registry.js";
import type { RenderContext } from "./renderer-types.js";
import { expandEmojiShortcodes } from "./transforms/expand-emoji-transform.js";
import { augmentTokens } from "./augment-tokens.js";
import { isEmbedRenderable } from "./renderable-checks.js";

function substituteString(value: string, tokens: TokenSource, botId: string): string {
    return expandEmojiShortcodes(renderTemplate(value, tokens), botId);
}

function substituteValue(raw: unknown, tokens: TokenSource, botId: string): unknown {
    if (typeof raw === "string") return substituteString(raw, tokens, botId);
    if (Array.isArray(raw)) return raw.map((entry) => substituteValue(entry, tokens, botId));
    if (isPlainObject(raw)) return substituteEmbed(raw, tokens, botId);
    return raw;
}

function substituteEmbed(embed: object, tokens: TokenSource, botId: string): object {
    const out: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(embed as Record<string, unknown>)) {
        out[key] = substituteValue(raw, tokens, botId);
    }
    return out;
}

function resolveContent(row: AutoHookRow, defaultContent: string, tokens: TokenSource, botId: string): string {
    if (row.content_template === null || row.content_template.length === 0)
        return expandEmojiShortcodes(defaultContent, botId);
    return substituteString(row.content_template, tokens, botId);
}

function resolveEmbed(
    row: AutoHookRow,
    defaultEmbed: object | null,
    tokens: TokenSource,
    botId: string,
): object | null {
    if (row.use_embed !== 1) return null;
    if (row.embed_template_json === null || row.embed_template_json.length === 0) return defaultEmbed;
    try {
        const parsed = JSON.parse(row.embed_template_json) as object;
        const substituted = substituteEmbed(parsed, tokens, botId);
        if (!isEmbedRenderable(substituted)) return null;
        return substituted;
    } catch {
        return defaultEmbed;
    }
}

function resolveUsername(row: AutoHookRow, defaultUsername: string, tokens: TokenSource): string {
    if (row.webhook_username_override !== null && row.webhook_username_override.length > 0) {
        return renderTemplate(row.webhook_username_override, tokens);
    }
    return defaultUsername;
}

function resolveAvatarUrl(row: AutoHookRow, tokens: TokenSource): string | null {
    if (row.webhook_avatar_url_override !== null && row.webhook_avatar_url_override.length > 0) {
        return renderTemplate(row.webhook_avatar_url_override, tokens);
    }
    return null;
}

export function renderAutoHook(row: AutoHookRow, payload: object, context: RenderContext): WebhookEnvelope | null {
    const renderer = pickRenderer(row.trigger_type);
    if (renderer === null) return null;
    const body = renderer({ payload, context });
    const tokens = augmentTokens(body.tokens, payload);
    const embed = resolveEmbed(row, body.embed, tokens, context.botId);
    const content = embed === null ? resolveContent(row, body.content, tokens, context.botId) : "";
    return buildWebhookEnvelope({
        content,
        username: resolveUsername(row, body.username, tokens),
        embeds: embed === null ? null : [embed],
        avatarUrl: resolveAvatarUrl(row, tokens),
    });
}
