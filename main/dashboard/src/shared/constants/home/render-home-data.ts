export interface CapabilityCard {
    iconClasses: readonly string[];
    title: string;
    desc: string;
}

export const CAPABILITIES: readonly CapabilityCard[] = [
    {
        iconClasses: ["ti", "ti-broadcast"],
        title: "Live telemetry",
        desc: "RuneLite plugin streams positions, chat, drops, and progression in realtime.",
    },
    {
        iconClasses: ["ti", "ti-shield-check"],
        title: "Verified identity",
        desc: "Members prove RSN ownership and clan membership through the plugin, not a form.",
    },
    {
        iconClasses: ["ti", "ti-brand-discord"],
        title: "Discord management",
        desc: "Stage server edits as drafts, publish via queue, automate via event-triggered webhooks.",
    },
    {
        iconClasses: ["ti", "ti-chart-arrows"],
        title: "Wise Old Man backfill",
        desc: "Hiscore data fills in for members the plugin cant see, mobile-only included.",
    },
    {
        iconClasses: ["ti", "ti-cube-3d-sphere"],
        title: "Voxlab clan visuals",
        desc: "Browser-based 3D editor for clan badges, banners, and animated identity.",
    },
    {
        iconClasses: ["ti", "ti-message-circle-2"],
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
export const URL_VOXLAB = "/voxlab";
export const URL_DOWNLOAD_WIN = "/provide/clansocket_latest.exe";
export const URL_DOWNLOAD_LINUX = "/provide/clansocket_latest_linux_tar.gz";
export const URL_BMAC = "https://buymeacoffee.com/clansocket";
export const URL_GITHUB_DEV = "https://github.com/Varietyz";
export const URL_DISCORD_CONTACT = "https://discordapp.com/users/406828985696387081";
export const URL_LINKEDIN = "https://www.linkedin.com/in/jay-baleine/";

export const SITE_LOGO_RECORD_URL = "/api/site/logo-record";
export const SITE_LOGO_THUMBNAIL_URL = "/api/site/logo";
export const SITE_LOGO_SLUG = "__site__";

export const UPLOAD_ACCEPT = "image/svg+xml,image/png,image/webp,application/json,.svg,.png,.webp,.json";
export const MOBILE_LOGO_PAN_X = -0.3;

export const BTN_CLASS = "btn";
export const BTN_OUTLINE_CLASS = "btn--outline";
export const BTN_COMPACT_CLASS = "btn--compact";

export const COMMUNITY_BODY =
    "Looking to connect with other OSRS clan owners and staff? Head over to Clan Central for peer support, inter-clan events, and bad-actor reports.";
export const DOWNLOADS_BODY = "Don't like web browsers? Grab the latest desktop build for your platform below.";

export interface ResourceLink {
    href: string;
    title: string;
    desc: string;
    iconClasses: readonly string[];
}

export const RESOURCES: readonly ResourceLink[] = [
    {
        href: URL_PLUGIN_REPO,
        title: "Plugin Source Code",
        desc: "Java · v1.0.0",
        iconClasses: ["mdi", "mdi-language-java"],
    },
    {
        href: URL_PLUGIN_HUB,
        title: "RuneLite Plugin-hub",
        desc: "official plugin-hub listing",
        iconClasses: ["ti", "ti-plug-connected"],
    },
    { href: URL_CLAIM_WIKI, title: "Wiki", desc: "wiki guide for clan owners", iconClasses: ["ti", "ti-brand-github"] },
    {
        href: URL_MAIN_REPO,
        title: "Platform Source Code",
        desc: "TypeScript · v1.0.0",
        iconClasses: ["ti", "ti-brand-typescript"],
    },
];
