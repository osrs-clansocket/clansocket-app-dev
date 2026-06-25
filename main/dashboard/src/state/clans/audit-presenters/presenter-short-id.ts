const SHORT_ID_LEN = 8;

export function shortId(id: string | null): string {
    if (id === null) return "";
    return id.length > SHORT_ID_LEN ? `${id.slice(0, SHORT_ID_LEN)}…` : id;
}
