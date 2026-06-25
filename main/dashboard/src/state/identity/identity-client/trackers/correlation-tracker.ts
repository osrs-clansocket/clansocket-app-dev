let causalCorrelationId: string | null = null;

export function setCorrelationId(id: string | null): void {
    causalCorrelationId = id;
}

export function getCorrelationId(): string | null {
    return causalCorrelationId;
}
