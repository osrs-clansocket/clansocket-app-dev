import type { EmbedState } from "../../../../dom/pages/clans/manage/discord/modes/auto-hooks/embed-editor.js";

interface RawEmbed {
    title?: string;
    description?: string;
    color?: number | string;
    url?: string;
    author?: { name?: string; icon_url?: string };
    footer?: { text?: string; icon_url?: string };
    thumbnail?: { url?: string };
    image?: { url?: string };
}

const FALLBACK_EMBED: EmbedState = {
    title: "",
    description: "",
    color: "#5865F2",
    url: "",
    authorName: "",
    authorIconUrl: "",
    footerText: "",
    footerIconUrl: "",
    thumbnailUrl: "",
    imageUrl: "",
};

const HEX_RADIX = 16;
const HEX_COLOR_DIGITS = 6;

function parseEmbedColor(color: number | string | undefined): string {
    if (typeof color === "number") return `#${color.toString(HEX_RADIX).padStart(HEX_COLOR_DIGITS, "0")}`;
    return color ?? "#5865F2";
}

function parseEmbedState(p: RawEmbed): EmbedState {
    return {
        title: p.title ?? "",
        description: p.description ?? "",
        color: parseEmbedColor(p.color),
        url: p.url ?? "",
        authorName: p.author?.name ?? "",
        authorIconUrl: p.author?.icon_url ?? "",
        footerText: p.footer?.text ?? "",
        footerIconUrl: p.footer?.icon_url ?? "",
        thumbnailUrl: p.thumbnail?.url ?? "",
        imageUrl: p.image?.url ?? "",
    };
}

export function parseEmbedTemplate(json: string | null): EmbedState {
    if (json === null || json.length === 0) return FALLBACK_EMBED;
    try {
        return parseEmbedState(JSON.parse(json) as RawEmbed);
    } catch {
        return FALLBACK_EMBED;
    }
}

function hasText(s: string | undefined): boolean {
    return typeof s === "string" && s.length > 0;
}

function embedHasContent(o: RawEmbed): boolean {
    if (hasText(o.title) || hasText(o.description) || hasText(o.url)) return true;
    return o.author !== undefined || o.footer !== undefined || o.thumbnail !== undefined || o.image !== undefined;
}

function applyAuthor(obj: RawEmbed, name: string, iconUrl: string): void {
    if (name.length === 0 && iconUrl.length === 0) return;
    obj.author = { name: name.length > 0 ? name : " " };
    if (iconUrl.length > 0) obj.author.icon_url = iconUrl;
}

function applyFooter(obj: RawEmbed, text: string, iconUrl: string): void {
    if (text.length === 0 && iconUrl.length === 0) return;
    obj.footer = { text: text.length > 0 ? text : " " };
    if (iconUrl.length > 0) obj.footer.icon_url = iconUrl;
}

export function serializeEmbedTemplate(s: EmbedState): string | null {
    const colorInt = parseInt(s.color.replace("#", ""), 16);
    const obj: RawEmbed = {};
    if (s.title.length > 0) obj.title = s.title;
    if (s.description.length > 0) obj.description = s.description;
    if (Number.isFinite(colorInt)) obj.color = colorInt;
    if (s.url.length > 0) obj.url = s.url;
    applyAuthor(obj, s.authorName, s.authorIconUrl);
    applyFooter(obj, s.footerText, s.footerIconUrl);
    if (s.thumbnailUrl.length > 0) obj.thumbnail = { url: s.thumbnailUrl };
    if (s.imageUrl.length > 0) obj.image = { url: s.imageUrl };
    if (!embedHasContent(obj)) return null;
    return JSON.stringify(obj);
}
