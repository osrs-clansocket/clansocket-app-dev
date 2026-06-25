let identSubId: string | null = null;

export function getIdentId(): string | null {
    return identSubId;
}

export function setIdentId(id: string | null): void {
    identSubId = id;
}
