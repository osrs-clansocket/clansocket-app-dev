export async function readError(res: Response): Promise<string> {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    return body.error ?? `error ${res.status}`;
}
