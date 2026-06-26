import type { IconEntry } from "../../../icons/providers.js";

export interface CapabilityCard {
    icon: IconEntry;
    title: string;
    desc: string;
}

export const CAPABILITIES: readonly CapabilityCard[] = [
    {
        icon: { provider: "ti", name: "broadcast" },
        title: "Live telemetry",
        desc: "RuneLite plugin streams positions, chat, drops, and progression in realtime.",
    },
    {
        icon: { provider: "ti", name: "shield-check" },
        title: "Verified identity",
        desc: "Members prove RSN ownership and clan membership through the plugin, not a form.",
    },
    {
        icon: { provider: "ti", name: "brand-discord" },
        title: "Discord management",
        desc: "Stage server edits as drafts, publish via queue, automate via event-triggered webhooks.",
    },
    {
        icon: { provider: "ti", name: "chart-arrows" },
        title: "Wise Old Man backfill",
        desc: "Hiscore data fills in for members the plugin cant see, mobile-only included.",
    },
    {
        icon: { provider: "ti", name: "message-circle-2" },
        title: "AI clan operator",
        desc: "Varez queries live telemetry, generates reports, and operates the dashboard for you.",
    },
];

export const URL_PLUGIN_REPO = "https://github.com/osrs-clansocket/clansocket-plugin";
export const URL_MAIN_REPO = "https://github.com/osrs-clansocket/clansocket";
export const URL_PLUGIN_HUB = "https://runelite.net/plugin-hub/show/clansocket";
export const URL_CLAIM_WIKI = "https://github.com/osrs-clansocket/clansocket-plugin/wiki/Claim-Your-Clan";
export const URL_DISCORD_INVITE = "https://discord.gg/qjpQDNe6xE";
export const URL_PRIVACY = "/privacy";
export const URL_TERMS = "/terms";
export const URL_DOWNLOAD_WIN = "/provide/clansocket_latest.exe";
export const URL_DOWNLOAD_LINUX = "/provide/clansocket_latest_linux_tar.gz";
export const URL_BMAC = "https://buymeacoffee.com/clansocket";
export const URL_GITHUB_DEV = "https://github.com/Varietyz";
export const URL_DISCORD_CONTACT = "https://discordapp.com/users/406828985696387081";
export const URL_LINKEDIN = "https://www.linkedin.com/in/jay-baleine/";

export const SITE_LOGO_THUMBNAIL_URL = "/resources/clan/static_logo_400.webp";
export const SITE_LOGO_THUMBNAIL_SRCSET =
    "/resources/clan/static_logo_200.webp 200w, /resources/clan/static_logo_400.webp 400w, /resources/clan/static_logo_600.webp 600w";
export const SITE_LOGO_THUMBNAIL_SIZES = "(min-width: 1280px) 200px, (min-width: 768px) 180px, 166px";
export const SITE_LOGO_SLUG = "__site__";

export const UPLOAD_ACCEPT = "image/svg+xml,image/png,image/webp,.svg,.png,.webp";

export const BTN_CLASS = "btn";
export const BTN_OUTLINE_CLASS = "btn--outline";
export const BTN_COMPACT_CLASS = "btn--compact";

export const COMMUNITY_BODY =
    "Discord for OSRS clan owners and staff. Peer support, idea exchange, clan-vs-clan events, and bad-actor reports across the community.";
export const COMMUNITY_DISCLAIMER =
    "Clan members should join their own clan's discord if one exists — Clan Central doesn't tailor to regular members.";
export const DOWNLOADS_BODY = "Don't like web browsers? Grab the latest desktop build for your platform below.";

export interface ResourceLink {
    href: string;
    title: string;
    desc: string;
    icon: IconEntry;
}

export const RESOURCES: readonly ResourceLink[] = [
    {
        href: URL_PLUGIN_REPO,
        title: "Plugin Source Code",
        desc: "Java · v1.0.0",
        icon: { provider: "mdi", name: "language-java" },
    },
    {
        href: URL_PLUGIN_HUB,
        title: "RuneLite Plugin-hub",
        desc: "official plugin-hub listing",
        icon: { provider: "ti", name: "plug-connected" },
    },
    {
        href: URL_CLAIM_WIKI,
        title: "Wiki",
        desc: "wiki guide for clan owners",
        icon: { provider: "ti", name: "brand-github" },
    },
    {
        href: URL_MAIN_REPO,
        title: "Platform Source Code",
        desc: "TypeScript · v1.0.0",
        icon: { provider: "ti", name: "brand-typescript" },
    },
];
