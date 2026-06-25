const SLUG_MAX_BASE_LEN = 32;

export function slugify(name: string): string {
    const normalized = name.toLowerCase().normalize("NFKD");
    const parts: string[] = [];
    let prevWasHyphen = false;
    for (const c of normalized) {
        const isAlnum = (c >= "a" && c <= "z") || (c >= "0" && c <= "9");
        if (isAlnum) {
            parts.push(c);
            prevWasHyphen = false;
        } else if (!prevWasHyphen && parts.length > 0) {
            parts.push("-");
            prevWasHyphen = true;
        } else {
            prevWasHyphen = true;
        }
    }
    let result = parts.join("");
    while (result.endsWith("-")) result = result.slice(0, -1);
    const base = result.slice(0, SLUG_MAX_BASE_LEN);
    return base.length > 0 ? base : "clan";
}
