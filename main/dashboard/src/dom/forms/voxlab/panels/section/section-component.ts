import { div, heading } from "../../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../../managers/voxlab/base/base-voxlab-component.js";
import { snapshotRegistry, type PathSpec } from "../../../../../state/voxlab/registries/snapshot-registry.js";
import { DropdownComponent } from "../dropdown-component.js";
import { installField, type FieldStores, type SectionConfig, type SectionField } from "./section-fields.js";
export type {
    ColorFieldConfig,
    DropdownFieldConfig,
    SectionConfig,
    SectionField,
    SliderFieldConfig,
    ToggleFieldConfig,
} from "./section-fields.js";

const CLS_SECTION = "voxlab__footer-section";
const CLS_HEADING = "voxlab__footer-section-heading";

export class SectionComponent<TSettings extends object> extends BaseVoxlabComponent {
    private settings: TSettings;
    private readonly inputsByKey = new Map<keyof TSettings, HTMLInputElement>();
    private readonly dropdownsByKey = new Map<keyof TSettings, DropdownComponent<string>>();

    constructor(private readonly config: SectionConfig<TSettings>) {
        super();
        this.settings = { ...config.defaults };
        const paths = config.fields.map((f) => f.snapshotPath).filter((p): p is PathSpec => p !== undefined);
        snapshotRegistry.register<TSettings>({
            name: config.snapshotName,
            getState: () => this.current,
            applyState: (state, opts) => this.apply(state, opts),
            paths,
        });
    }

    get current(): TSettings {
        return { ...this.settings };
    }

    private applyField(field: SectionField<TSettings>, value: TSettings[keyof TSettings]): void {
        if (field.type === "dropdown") {
            this.dropdownsByKey.get(field.key)?.select(String(value));
            return;
        }
        const input = this.inputsByKey.get(field.key);
        if (!input) return;
        if (field.type === "toggle") input.checked = Boolean(value);
        else input.value = String(value);
    }

    apply(state: TSettings, opts?: { silent?: boolean }): void {
        this.settings = { ...state };
        for (const field of this.config.fields) {
            this.applyField(field, this.settings[field.key]);
        }
        if (!opts?.silent) {
            this.emit<TSettings>(this.config.eventName, this.current);
        }
    }

    reset(): void {
        this.apply({ ...this.config.defaults });
    }

    private get stores(): FieldStores<TSettings> {
        return {
            settings: this.settings as Record<string, unknown>,
            inputsByKey: this.inputsByKey,
            dropdownsByKey: this.dropdownsByKey,
        };
    }

    protected build(): HTMLElement {
        const section = div({ classes: [CLS_SECTION], context: null, meta: null }, [
            heading("h3", { classes: [CLS_HEADING], text: this.config.title, context: null, meta: null }),
        ]);
        const emit = (): void => {
            this.emit<TSettings>(this.config.eventName, this.current);
        };
        const stores = this.stores;
        for (const field of this.config.fields) {
            installField({ defaultValue: this.config.defaults[field.key], field, section, emit, stores });
        }
        return section.el;
    }

    protected onUnmount(): void {
        for (const dd of this.dropdownsByKey.values()) {
            dd.unmount();
        }
    }
}
