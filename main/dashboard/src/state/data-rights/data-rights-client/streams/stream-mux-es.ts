let es: EventSource | null = null;

export function getEs(): EventSource | null {
    return es;
}

export function setEs(e: EventSource | null): void {
    es = e;
}
