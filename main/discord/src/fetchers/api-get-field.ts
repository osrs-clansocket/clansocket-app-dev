import { apiGet } from "./api-fetcher.js";

export async function apiGetField<T>(path: string, field: string): Promise<T | null> {
    const body = await apiGet<Record<string, T | null | undefined>>(path);
    return body?.[field] ?? null;
}
