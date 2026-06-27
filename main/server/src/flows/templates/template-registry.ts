import { BaseRegistry } from "../../base/base-registry.js";
import type { FlowTemplate } from "./template-types.js";

class TemplateRegistryStore extends BaseRegistry<string, FlowTemplate> {}

export const templateRegistry = new TemplateRegistryStore();

export function registerTemplate(template: FlowTemplate): void {
    templateRegistry.registerUnique(template.id, template, (key) => new Error(`template "${key}" already registered`));
}
