import { type Instance } from "../../../../factory/index.js";

export interface DateState {
    view: Date;
    selected: string;
    placeholder: string;
}

export interface GlassDateParts {
    state: DateState;
    popup: Instance;
    labelInst: Instance;
    hidden: Instance<HTMLInputElement>;
    renderPopup: () => void;
    onChange?: (iso: string) => void;
}
