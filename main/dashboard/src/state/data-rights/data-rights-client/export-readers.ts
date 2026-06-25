import type { DataExport } from "./export-types.js";

function stripExportQuotes(s: string): string {
    let out = s;
    while (out.startsWith('"')) out = out.slice(1);
    while (out.endsWith('"')) out = out.slice(0, -1);
    return out;
}

export async function readExport(res: Response, defaultFilename: string): Promise<DataExport> {
    const cd = res.headers.get("content-disposition") ?? "";
    const match = cd.indexOf("filename=");
    let filename = defaultFilename;
    if (match >= 0) {
        const tail = stripExportQuotes(cd.slice(match + "filename=".length));
        if (tail.length > 0) filename = tail;
    }
    const blob = await res.blob();
    return { blob, filename };
}
