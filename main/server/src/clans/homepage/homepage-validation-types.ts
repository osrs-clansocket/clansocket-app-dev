import type { ComponentKind } from "@clansocket/constants/clan-homepage-tokens";

export interface ValidatedComponent {
    componentId: string;
    componentName: ComponentKind;
    canvasX: number;
    canvasY: number;
    canvasW: number;
    canvasH: number;
    zIndex: number;
    payload: {
        text?: string;
        imageKey?: string;
        imageVersion?: number;
        label?: string;
        value?: string;
        chartPresetId?: string;
    };
    tokenOverrides: Record<string, string>;
    parentId: string | null;
}

export interface ValidationError {
    componentId: string;
    code: string;
    detail: string;
}

export interface ValidationResult {
    components: ValidatedComponent[];
    errors: ValidationError[];
}
