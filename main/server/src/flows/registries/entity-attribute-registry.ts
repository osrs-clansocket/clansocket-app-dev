import { BaseRegistry } from "../../base/base-registry.js";
import type { FlowFieldType } from "./payload-field-types.js";

export interface RegisteredEntityAttribute {
    readonly path: string;
    readonly label: string;
    readonly type: FlowFieldType;
    readonly sqlTable: string;
    readonly sqlColumn: string;
    readonly valueSourceRef?: string;
}

class EntityAttributeRegistryStore extends BaseRegistry<string, RegisteredEntityAttribute> {}

export const entityAttributeRegistry = new EntityAttributeRegistryStore();

export function registerEntityAttribute(spec: RegisteredEntityAttribute): void {
    entityAttributeRegistry.registerUnique(
        spec.path,
        spec,
        (key) => new Error(`entity attribute "${key}" already registered`),
    );
}

export function attributesByTable(sqlTable: string): readonly RegisteredEntityAttribute[] {
    return entityAttributeRegistry.list().filter((a) => a.sqlTable === sqlTable);
}
