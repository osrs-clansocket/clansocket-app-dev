import type { Request } from "express";

export function publicBaseUrl(_req: Request): string {
    const fromEnv = process.env.OAUTH_PUBLIC_BASE_URL;
    if (!fromEnv) {
        throw new Error(
            "OAUTH_PUBLIC_BASE_URL must be set (host header is not trusted for OAuth redirect URL construction)",
        );
    }
    let stripped = fromEnv;
    while (stripped.endsWith("/")) stripped = stripped.slice(0, -1);
    return stripped;
}

export function githubConfigured(): boolean {
    return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
}

export function discordClientId(): string | undefined {
    return process.env.CLIENT_ID;
}

export function discordConfigured(): boolean {
    return Boolean(discordClientId() && process.env.DISCORD_CLIENT_SECRET);
}
