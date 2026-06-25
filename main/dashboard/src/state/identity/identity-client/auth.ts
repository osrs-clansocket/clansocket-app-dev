import { jsonOrFallback } from "../../fetch-result.js";
import { sameOriginFetch } from "../../../shared/fetchers/same-origin-fetcher.js";
import { okResult } from "./builders/result-builder.js";
import type { OkResult, SiteAccount } from "./types.js";

export const loginUrls = {
    github: "/api/auth/site/github/start",
    discord: "/api/auth/site/discord/start",
    githubLink: "/api/auth/site/github/start-link",
    discordLink: "/api/auth/site/discord/start-link",
} as const;

export async function session(): Promise<SiteAccount | null> {
    const res = await sameOriginFetch("/api/auth/site/me");
    return jsonOrFallback<SiteAccount | null>(res, null);
}

export async function logout(): Promise<OkResult> {
    return okResult(await sameOriginFetch("/api/auth/site/logout", { method: "POST" }), async () => undefined);
}

export function startGithubLogin(): void {
    window.location.href = loginUrls.github;
}
export function startDiscordLogin(): void {
    window.location.href = loginUrls.discord;
}
export function startGithubLink(): void {
    window.location.href = loginUrls.githubLink;
}
export function startDiscordLink(): void {
    window.location.href = loginUrls.discordLink;
}
