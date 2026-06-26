import { apiRequest } from "../../fetchers/api-fetcher.js";
import { HTTP_METHOD_POST } from "../../core/constants.js";

export async function postOk(path: string, body: object): Promise<boolean> {
    const result = await apiRequest<{ ok: boolean }>(HTTP_METHOD_POST, path, body);
    return result?.ok ?? false;
}
