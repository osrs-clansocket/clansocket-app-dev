import { div, baseProps, effect, signal } from "../../../../../../factory";
import { buildGlassSelect, type SelectOption } from "../../../../../../forms/glass/inputs/select/index.js";
import { registerFormat, type FormatPicker, type JSONSchemaNode } from "../format-registry.js";

interface DataSourceItem {
    id: string;
    name: string;
}

const cache = new Map<string, readonly DataSourceItem[]>();

async function fetchRoles(clanId: string): Promise<readonly DataSourceItem[]> {
    const cached = cache.get(clanId);
    if (cached) return cached;
    try {
        const response = await fetch(
            `/api/flows/data-source?source=discord:roles&clan_id=${encodeURIComponent(clanId)}`,
        );
        if (!response.ok) return [];
        const body = (await response.json()) as { items: readonly DataSourceItem[] };
        cache.set(clanId, body.items);
        return body.items;
    } catch {
        return [];
    }
}

const rolePicker: FormatPicker = (_schema: JSONSchemaNode, value, onChange, ctx) => {
    const host = div(baseProps([]));
    const optionsSignal = signal<readonly SelectOption[]>([
        { value: "", label: "Pick a role" },
        { value, label: value.length > 0 ? value : "—" },
    ]);
    void fetchRoles(ctx.clanId).then((items) => {
        const opts: SelectOption[] = [{ value: "", label: "Pick a role" }];
        for (const item of items) opts.push({ value: item.id, label: `@${item.name}` });
        optionsSignal.set(opts);
    });
    effect(() => {
        const opts = optionsSignal();
        const select = buildGlassSelect(`role-${ctx.fieldName}-${ctx.operationId ?? "op"}`, opts, value);
        const hidden = select.el.querySelector<HTMLInputElement>("input[type='hidden']");
        if (hidden) hidden.addEventListener("change", () => onChange(hidden.value));
        host.setChildren(select);
    });
    return host;
};

registerFormat("discord-role-id", rolePicker);
