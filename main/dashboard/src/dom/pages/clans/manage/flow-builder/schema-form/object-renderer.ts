import { div, span, baseProps, textProps, type Instance } from "../../../../../factory/index.js";
import { glassInput } from "../../../../../forms/glass/inputs/glass-input.js";
import { renderStringControl } from "./string-renderer.js";
import { renderNumberControl } from "./number-renderer.js";
import { renderBooleanControl } from "./boolean-renderer.js";
import { readTitle, readType } from "../../../../../../state/flows/schema-types-reader.js";
import { asBoolean, asString } from "../../../../../../state/flows/value-coerce.js";
import type { ControlProps, ObjectProps, RowProps } from "./render-types.js";

const ROW_CLASS = "clans-manage__flow-builder-schema-row";
const LABEL_CLASS = "clans-manage__flow-builder-schema-label";
const CONTROL_CLASS = "clans-manage__flow-builder-schema-control";
const NESTED_CLASS = "clans-manage__flow-builder-schema-nested";

function renderFallback(p: ControlProps): Instance {
    return glassInput({
        value: asString(p.current),
        placeholder: readTitle(p.schema, p.fieldName),
        ariaLabel: p.fieldName,
        autocomplete: "off",
    });
}

const TYPE_DISPATCH: Readonly<Record<string, (p: ControlProps) => Instance>> = {
    string: (p) => renderStringControl({ ...p, current: asString(p.current) }),
    number: (p) => renderNumberControl({ ...p, current: typeof p.current === "number" ? p.current : null }),
    integer: (p) => renderNumberControl({ ...p, current: typeof p.current === "number" ? p.current : null }),
    boolean: (p) => renderBooleanControl({ fieldName: p.fieldName, current: asBoolean(p.current), onChange: p.onChange }),
    object: (p) => renderObject({
        schema: p.schema,
        value: (p.current as Record<string, unknown> | null) ?? {},
        onChange: p.onChange as (next: Record<string, unknown>) => void,
        ctx: p.ctx,
        nested: true,
    }),
};

function renderControl(p: ControlProps): Instance {
    const type = readType(p.schema);
    const handler = type === null ? null : TYPE_DISPATCH[type] ?? null;
    return handler ? handler(p) : renderFallback(p);
}

function renderRow(p: RowProps): Instance {
    const labelText = readTitle(p.schema, p.fieldName);
    const labelInst = span(textProps([LABEL_CLASS], labelText));
    const childCtx = { ...p.ctx, fieldName: p.fieldName };
    const control = renderControl({ ...p, ctx: childCtx });
    const controlWrap = div(baseProps([CONTROL_CLASS]), [control]);
    return div(baseProps([ROW_CLASS]), [labelInst, controlWrap]);
}

export function renderObject(p: ObjectProps): Instance {
    const properties = p.schema.properties as Readonly<Record<string, Readonly<Record<string, unknown>>>> | undefined;
    const rows: Instance[] = [];
    if (properties) {
        for (const [fieldName, childSchema] of Object.entries(properties)) {
            const onChange = (next: unknown): void => p.onChange({ ...p.value, [fieldName]: next });
            rows.push(renderRow({ fieldName, onChange, schema: childSchema, current: p.value[fieldName], ctx: p.ctx }));
        }
    }
    const wrapperClass = p.nested ? NESTED_CLASS : "";
    return div(baseProps(wrapperClass ? [wrapperClass] : []), rows);
}
