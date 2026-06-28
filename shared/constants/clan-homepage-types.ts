import type { ComponentKind } from "./clan-homepage-tokens.ts";

export type HomepageComponentKind = ComponentKind;

export interface HomepageComponentPayload {
    readonly text?: string;
    readonly imageKey?: string;
    readonly imageVersion?: number;
    readonly label?: string;
    readonly value?: string;
    readonly chartPresetId?: string;
}

export interface HomepageComponent {
    readonly componentId: string;
    readonly componentName: HomepageComponentKind;
    readonly canvasX: number;
    readonly canvasY: number;
    readonly canvasW: number;
    readonly canvasH: number;
    readonly zIndex: number;
    readonly payload: HomepageComponentPayload;
    readonly tokenOverrides: Record<string, string>;
    readonly parentId: string | null;
}

export interface HomepageResponse {
    readonly components: HomepageComponent[];
}
