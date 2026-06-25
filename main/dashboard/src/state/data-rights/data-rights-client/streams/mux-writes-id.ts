let writesSubId: string | null = null;

export function getWritesId(): string | null {
    return writesSubId;
}

export function setWritesId(id: string | null): void {
    writesSubId = id;
}
