import { apiRequest } from "../../fetchers/api-fetcher.js";

export async function postOk(path: string, body: object): Promise<boolean> {
    const result = await apiRequest<{ ok: boolean }>("POST", path, body);
    return result?.ok ?? false;
}
