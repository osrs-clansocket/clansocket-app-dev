export interface FieldConfig {
    input: HTMLInputElement;
    eventType: "change" | "input";
    apply: (v: number) => void;
    baked: boolean;
}
