import type { OkResult } from "../types.js";
import { readError } from "../parsers/error-parser.js";

export async function okResult<T>(res: Response, parse: (r: Response) => Promise<T>): Promise<OkResult<T>> {
    if (res.ok) return { ok: true, result: await parse(res) };
    return { ok: false, error: await readError(res) };
}
