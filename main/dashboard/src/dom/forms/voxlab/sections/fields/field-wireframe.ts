export interface WireframeFields {
    enabled: boolean;
    color: string;
    opacity: number;
}

export const DEFAULT_WIREFRAME: WireframeFields = { enabled: false, color: "#f5ca7a", opacity: 0.35 };
