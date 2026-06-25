import { MIME_FORM_URLENCODED, MIME_JSON } from "../../shared/http/http-mime.js";
import { buildOauthUrl } from "./oauth-client.js";

const DISCORD_AUTHORIZE_URL = "https://discord.com/api/oauth2/authorize";
const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";
const BOT_SCOPES = "bot applications.commands";
const PERMISSION_ADMINISTRATOR = "8";
const RADIX_DECIMAL = 10;

export interface BotInstallResult {
    accessToken: string;
    guildId: string;
    guildName: string;
    guildIconHash: string | null;
    permissions: number;
}

interface DiscordExchangeJson {
    access_token?: string;
    guild?: { id?: string; name?: string; icon?: string | null };
    permissions?: string | number;
    error?: string;
    error_description?: string;
}

export function botInstallUrl(clientId: string, state: string, redirectUri: string): string {
    return buildOauthUrl(DISCORD_AUTHORIZE_URL, {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: BOT_SCOPES,
        permissions: PERMISSION_ADMINISTRATOR,
        state,
    });
}

interface ExchangeArgs {
    clientId: string;
    clientSecret: string;
    code: string;
    redirectUri: string;
}

async function postTokenExchange(a: ExchangeArgs): Promise<DiscordExchangeJson> {
    const res = await fetch(DISCORD_TOKEN_URL, {
        method: "POST",
        headers: { Accept: MIME_JSON, "Content-Type": MIME_FORM_URLENCODED },
        body: new URLSearchParams({
            code: a.code,
            client_id: a.clientId,
            client_secret: a.clientSecret,
            grant_type: "authorization_code",
            redirect_uri: a.redirectUri,
        }).toString(),
    });
    if (!res.ok) throw new Error(`discord_bot_install_exchange_failed status=${res.status}`);
    return (await res.json()) as DiscordExchangeJson;
}

function parsePermissions(value: string | number | undefined): number {
    if (typeof value === "string") return parseInt(value, RADIX_DECIMAL);
    return value ?? 0;
}

export async function exchangeInstall(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string,
): Promise<BotInstallResult> {
    const json = await postTokenExchange({ clientId, clientSecret, code, redirectUri });
    if (!json.access_token || !json.guild?.id || !json.guild.name) {
        throw new Error(
            `discord_bot_install_exchange_failed: ${json.error_description ?? json.error ?? "missing fields"}`,
        );
    }
    return {
        accessToken: json.access_token,
        guildId: json.guild.id,
        guildName: json.guild.name,
        guildIconHash: json.guild.icon ?? null,
        permissions: parsePermissions(json.permissions),
    };
}
