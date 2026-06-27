import { div, span, baseProps, textProps, wireInput, type Instance } from "../../../../../factory/index.js";
import { glassInput } from "../../../../../forms/glass/inputs/glass-input.js";
import { buildGlassCheck } from "../../../../../forms/glass/inputs/glass-check.js";
import { buildGlassSelect, type SelectOption } from "../../../../../forms/glass/inputs/select/index.js";
import { getFormat, type FormatPickerContext, type JSONSchemaNode } from "./format-registry.js";

const ROW_CLASS = "clans-manage__flow-builder-schema-row";
const LABEL_CLASS = "clans-manage__flow-builder-schema-label";
const CONTROL_CLASS = "clans-manage__flow-builder-schema-control";
const NESTED_CLASS = "clans-manage__flow-builder-schema-nested";

export interface SchemaFormProps {
    readonly schema: JSONSchemaNode;
    readonly value: Readonly<Record<string, unknown>>;
    readonly onChange: (next: Record<string, unknown>) => void;
    readonly ctx: FormatPickerContext;
}

function humanize(name: string): string {
    const spaced = name.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function readEnum(schema: JSONSchemaNode): readonly string[] | null {
    const e = schema.enum;
    if (!Array.isArray(e)) return null;
    return e.map((x) => String(x));
}

function readFormat(schema: JSONSchemaNode): string | undefined {
    const f = schema.format;
    return typeof f === "string" ? f : undefined;
}

function readType(schema: JSONSchemaNode): string | null {
    const t = schema.type;
    return typeof t === "string" ? t : null;
}

function readTitle(schema: JSONSchemaNode, fallback: string): string {
    const t = schema.title;
    return typeof t === "string" ? t : humanize(fallback);
}

function asString(v: unknown): string {
    if (v === null || v === undefined) return "";
    if (typeof v === "string") return v;
    return String(v);
}

function asBoolean(v: unknown): boolean {
    return Boolean(v);
}

function renderEnumControl(
    fieldName: string,
    options: readonly string[],
    current: string,
    onChange: (next: string) => void,
): Instance {
    const opts: SelectOption[] = options.map((value) => ({ value, label: value }));
    const select = buildGlassSelect(fieldName, opts, current);
    const hidden = select.el.querySelector<HTMLInputElement>("input[type='hidden']");
    if (hidden) hidden.addEventListener("change", () => onChange(hidden.value));
    return select;
}

function renderStringControl(
    fieldName: string,
    schema: JSONSchemaNode,
    current: string,
    onChange: (next: string) => void,
    ctx: FormatPickerContext,
): Instance {
    const format = readFormat(schema);
    const formatPicker = getFormat(format);
    if (formatPicker) return formatPicker(schema, current, onChange, ctx);
    const enumValues = readEnum(schema);
    if (enumValues) return renderEnumControl(fieldName, enumValues, current, onChange);
    const inputEl = glassInput({
        value: current,
        placeholder: readTitle(schema, fieldName),
        ariaLabel: fieldName,
        autocomplete: "off",
    });
    wireInput(inputEl.el, (e) => onChange((e.target as HTMLInputElement).value));
    return inputEl;
}

function renderNumberControl(
    fieldName: string,
    schema: JSONSchemaNode,
    current: number | null,
    onChange: (next: number | null) => void,
): Instance {
    const inputEl = glassInput({
        value: current === null ? "" : String(current),
        placeholder: readTitle(schema, fieldName),
        ariaLabel: fieldName,
        autocomplete: "off",
    });
    wireInput(inputEl.el, (e) => {
        const raw = (e.target as HTMLInputElement).value;
        if (raw.length === 0) {
            onChange(null);
            return;
        }
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) onChange(parsed);
    });
    return inputEl;
}

function renderBooleanControl(
    fieldName: string,
    current: boolean,
    onChange: (next: boolean) => void,
): Instance {
    return buildGlassCheck({
        name: fieldName,
        ariaLabel: fieldName,
        checked: () => current,
        onChange,
    });
}

function renderControl(
    fieldName: string,
    schema: JSONSchemaNode,
    current: unknown,
    onChange: (next: unknown) => void,
    ctx: FormatPickerContext,
): Instance {
    const type = readType(schema);
    if (type === "string") {
        return renderStringControl(fieldName, schema, asString(current), (next) => onChange(next), ctx);
    }
    if (type === "number" || type === "integer") {
        const numeric = typeof current === "number" ? current : null;
        return renderNumberControl(fieldName, schema, numeric, (next) => onChange(next));
    }
    if (type === "boolean") {
        return renderBooleanControl(fieldName, asBoolean(current), (next) => onChange(next));
    }
    if (type === "object") {
        const childValue = (current as Record<string, unknown> | null) ?? {};
        return renderObject(schema, childValue, (next) => onChange(next), ctx, true);
    }
    return glassInput({
        value: asString(current),
        placeholder: readTitle(schema, fieldName),
        ariaLabel: fieldName,
        autocomplete: "off",
    });
}

function renderRow(
    fieldName: string,
    childSchema: JSONSchemaNode,
    current: unknown,
    onFieldChange: (next: unknown) => void,
    ctx: FormatPickerContext,
): Instance {
    const labelText = readTitle(childSchema, fieldName);
    const labelInst = span(textProps([LABEL_CLASS], labelText));
    const childCtx: FormatPickerContext = { ...ctx, fieldName };
    const control = renderControl(fieldName, childSchema, current, onFieldChange, childCtx);
    const controlWrap = div(baseProps([CONTROL_CLASS]), [control]);
    return div(baseProps([ROW_CLASS]), [labelInst, controlWrap]);
}

function renderObject(
    schema: JSONSchemaNode,
    value: Readonly<Record<string, unknown>>,
    onChange: (next: Record<string, unknown>) => void,
    ctx: FormatPickerContext,
    nested: boolean,
): Instance {
    const properties = schema.properties as Readonly<Record<string, JSONSchemaNode>> | undefined;
    const rows: Instance[] = [];
    if (properties) {
        for (const [fieldName, childSchema] of Object.entries(properties)) {
            const current = value[fieldName];
            const onFieldChange = (next: unknown): void => onChange({ ...value, [fieldName]: next });
            rows.push(renderRow(fieldName, childSchema, current, onFieldChange, ctx));
        }
    }
    const wrapperClass = nested ? NESTED_CLASS : "";
    return div(baseProps(wrapperClass ? [wrapperClass] : []), rows);
}

export function schemaForm(props: SchemaFormProps): Instance {
    return renderObject(props.schema, props.value, props.onChange, props.ctx, false);
}
