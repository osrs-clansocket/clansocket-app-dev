export interface DisplayItem {
    role: string;
    content: string;
    raw?: string;
    events?: { type: string; payload: Record<string, unknown> }[];
    deepLink?: string;
}
