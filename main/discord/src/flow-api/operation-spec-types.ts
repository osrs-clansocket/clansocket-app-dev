import type { JSONSchema, SideEffectsDescriptor, ValidationDescriptor } from "./side-effect-types.js";

export interface OperationSpec<TInput = unknown, TOutput = unknown> {
    readonly input_schema: JSONSchema;
    readonly output_schema: JSONSchema;
    readonly side_effects: SideEffectsDescriptor;
    readonly validation: ValidationDescriptor;
    readonly handler: (input: TInput, ctx: unknown) => Promise<TOutput>;
}
