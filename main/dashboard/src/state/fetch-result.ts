export async function jsonOrFallback<T>(res: Response, fallback: T): Promise<T> {
    if (!res.ok) return fallback;
    return (await res.json()) as T;
}

export async function jsonOrThrow<T>(res: Response, label: string): Promise<T> {
    if (!res.ok) throw new Error(`${label} ${res.status}`);
    return (await res.json()) as T;
}

export async function okOrThrow<T>(res: Response, label: string): Promise<T> {
    const body = (await res.json()) as T;
    if (!res.ok) {
        const apiError = (body as unknown as { error?: string })?.error;
        throw new Error(apiError ?? `${label} ${res.status}`);
    }
    return body;
}
