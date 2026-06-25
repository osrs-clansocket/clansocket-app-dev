import { CLAN_PATH_PREFIX } from "./audit-client-config.js";

export function parseSlug(pathname: string): string | null {
    if (!pathname.startsWith(CLAN_PATH_PREFIX)) return null;
    const rest = pathname.slice(CLAN_PATH_PREFIX.length);
    const i = rest.indexOf("/");
    const slug = i === -1 ? rest : rest.slice(0, i);
    return slug.length > 0 ? slug : null;
}
