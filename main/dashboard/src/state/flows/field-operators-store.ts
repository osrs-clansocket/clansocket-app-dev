import { signal, type Signal } from "../../dom/factory/reactive/index.js";

export type FieldOperatorMap = Readonly<Record<string, readonly string[]>>;

export const fieldOperatorsSignal: Signal<FieldOperatorMap> = signal<FieldOperatorMap>({});

let loaded = false;

export async function ensureFieldOperatorsLoaded(): Promise<void> {
    if (loaded) return;
    loaded = true;
    try {
        const response = await fetch("/api/flows/field-operators");
        if (!response.ok) {
            loaded = false;
            return;
        }
        const body = (await response.json()) as { field_operators: FieldOperatorMap };
        fieldOperatorsSignal.set(body.field_operators ?? {});
    } catch {
        loaded = false;
    }
}

export function operatorsForFieldType(fieldType: string): readonly string[] {
    const map = fieldOperatorsSignal();
    return map[fieldType] ?? ["eq", "ne"];
}
