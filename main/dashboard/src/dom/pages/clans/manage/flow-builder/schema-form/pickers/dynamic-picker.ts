import { div, baseProps, effect, signal } from "../../../../../../factory";
import { buildGlassSelect, type SelectOption } from "../../../../../../forms/glass/inputs/select/index.js";
import { AsyncMemoCache } from "../../../../../../../state/caches/async-memo-cache.js";
import { registerFormat, type FormatPicker, type JSONSchemaNode } from "../format-registry.js";

interface ValueSourceItem {
    id: string;
    name: string;
    kind?: string;
}

const VALUE_SOURCE_CACHE = new AsyncMemoCache<string, readonly ValueSourceItem[]>({
    tag: "flow-value-sources",
    maxEntries: 256,
    ttlMs: 30_000,
});

async function fetchValueSource(format: string, clanId: string): Promise<readonly ValueSourceItem[]> {
    const cacheKey = `${format}:${clanId.length > 0 ? clanId : "__static__"}`;
    return VALUE_SOURCE_CACHE.getOrLoad(cacheKey, async () => {
        try {
            const params = new URLSearchParams({ format });
            if (clanId.length > 0) params.set("clan_id", clanId);
            const response = await fetch(`/api/flows/value-sources?${params.toString()}`);
            if (!response.ok) return [];
            const body = (await response.json()) as { items: readonly ValueSourceItem[] };
            return body.items;
        } catch {
            return [];
        }
    });
}

function pickerFor(format: string, placeholder: string): FormatPicker {
    return (_schema: JSONSchemaNode, value, onChange, ctx) => {
        const host = div(baseProps([]));
        const optionsSignal = signal<readonly SelectOption[]>([
            { value: "", label: placeholder },
            { value, label: value.length > 0 ? value : "—" },
        ]);
        void fetchValueSource(format, ctx.clanId).then((items) => {
            const opts: SelectOption[] = [{ value: "", label: placeholder }];
            for (const item of items) opts.push({ value: item.id, label: item.name });
            optionsSignal.set(opts);
        });
        host.trackDispose(effect(() => {
            const opts = optionsSignal();
            const select = buildGlassSelect(`${format}-${ctx.fieldName}-${ctx.operationId ?? "op"}`, opts, value);
            const hidden = select.el.querySelector<HTMLInputElement>("input[type='hidden']");
            if (hidden) hidden.addEventListener("change", () => onChange(hidden.value));
            host.setChildren(select);
        }));
        return host;
    };
}

const REGISTERED_FORMATS: readonly { format: string; placeholder: string }[] = [
    { format: "rsn", placeholder: "Pick a member" },
    { format: "clan-rank", placeholder: "Pick a rank" },
    { format: "discord-channel-id", placeholder: "Pick a channel" },
    { format: "discord-member-id", placeholder: "Pick a member" },
    { format: "discord-role-id", placeholder: "Pick a role" },
    { format: "discord-guild-id", placeholder: "Pick a guild" },
    { format: "discord-webhook-id", placeholder: "Pick a webhook" },
    { format: "discord-channel-type", placeholder: "Pick a channel type" },
    { format: "discord-verification-level", placeholder: "Pick a verification level" },
    { format: "osrs-skill", placeholder: "Pick a skill" },
    { format: "osrs-boss", placeholder: "Pick a boss" },
    { format: "osrs-activity", placeholder: "Pick an activity" },
    { format: "osrs-metric", placeholder: "Pick a metric" },
    { format: "wom-metric", placeholder: "Pick a metric" },
    { format: "wom-period", placeholder: "Pick a period" },
    { format: "iana-timezone", placeholder: "Pick a timezone" },
    { format: "cron-preset", placeholder: "Pick a schedule" },
    { format: "chatbox-color", placeholder: "Pick a color" },
    { format: "mime-type", placeholder: "Pick a content type" },
    { format: "loop-interval-preset", placeholder: "Pick an interval" },
    { format: "loop-interval-unit", placeholder: "Pick a unit" },
    { format: "loop-on-overlap", placeholder: "Pick a policy" },
];

for (const entry of REGISTERED_FORMATS) {
    registerFormat(entry.format, pickerFor(entry.format, entry.placeholder));
}
