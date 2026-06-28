export interface ConditionField {
    field: string;
    label: string;
    fieldType: string;
    format?: string;
}

const DYNAMIC_FIELDS_BY_TRIGGER: Map<string, readonly ConditionField[]> = new Map();

export function registerFieldsForTrigger(triggerType: string, fields: readonly ConditionField[]): void {
    DYNAMIC_FIELDS_BY_TRIGGER.set(triggerType, fields);
}

export function fieldsForTrigger(triggerType: string): readonly ConditionField[] {
    return DYNAMIC_FIELDS_BY_TRIGGER.get(triggerType) ?? [];
}
