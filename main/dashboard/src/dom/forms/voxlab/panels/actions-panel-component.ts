import { button, div, span, type Instance } from "../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../managers/voxlab/base/base-voxlab-component.js";
import type { HistoryChange, HistoryService } from "../../../../managers/voxlab/services/history-service.js";
import { modalService } from "../../../../managers/voxlab/services/modal-service.js";
import type { SceneSnapshot } from "../../../../shared/types/voxlab/snapshot-types.js";
import { describeEntry, formatPath, formatValue } from "./actions-formatter.js";

const CLS_PANEL = "voxlab__actions-panel";
const CLS_TITLE = "voxlab-panel__title";
const CLS_LIST = "voxlab__actions-list";
const CLS_EMPTY = "voxlab__actions-empty";
const CLS_ROW = "voxlab-panel__row";
const CLS_ROW_NAME = "voxlab-panel__row-name";
const CLS_ROW_ACTIONS = "voxlab-panel__row-actions";
const CLS_BTN = "voxlab-panel__row-btn";
const CLS_BTN_DANGER = "voxlab-panel__row-btn--danger";

const STYLE_THREE_COL = "display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0;";
const STYLE_BORDER_NONE = "border-right: 0";

export interface ActionsPanelDeps {
    history: HistoryService;
    getSnapshot: () => SceneSnapshot;
    onUndo: () => void;
    onRedo: () => void;
    onResetPath: (path: string) => void;
    onClearAll: () => void;
}

export class ActionsPanelComponent extends BaseVoxlabComponent {
    private undoBtn!: Instance<HTMLButtonElement>;
    private redoBtn!: Instance<HTMLButtonElement>;
    private clearBtn!: Instance<HTMLButtonElement>;
    private listHost!: Instance;

    constructor(private readonly deps: ActionsPanelDeps) {
        super();
        this.deps.history.addEventListener("history-change", () => this.refresh());
    }

    private actionBtn(
        text: string,
        ctx: string,
        onClick: () => void,
        opts: { style?: string; danger?: boolean },
    ): Instance<HTMLButtonElement> {
        return button({
            text,
            onClick,
            classes: [CLS_BTN],
            style: opts.style,
            context: ctx,
            meta: opts.danger ? ["action", "destructive"] : ["action"],
        });
    }

    private buildButtonRow(): Instance {
        this.undoBtn = this.actionBtn("Undo", "undo last setting change", () => this.deps.onUndo(), {
            style: STYLE_BORDER_NONE,
        });
        this.redoBtn = this.actionBtn("Redo", "redo last undone setting change", () => this.deps.onRedo(), {
            style: STYLE_BORDER_NONE,
        });
        this.clearBtn = this.actionBtn(
            "Clear",
            "clear all changed settings to defaults",
            () => void this.confirmClearAll(),
            { danger: true },
        );
        return div({ style: STYLE_THREE_COL, context: null, meta: null }, [this.undoBtn, this.redoBtn, this.clearBtn]);
    }

    protected build(): HTMLElement {
        const buttonRow = this.buildButtonRow();
        this.listHost = div({ classes: [CLS_LIST], context: null, meta: null });
        const panel = div({ classes: [CLS_PANEL], context: null, meta: null }, [
            buttonRow,
            div({ classes: [CLS_TITLE], text: "Changed settings", context: null, meta: null }),
            this.listHost,
        ]);
        this.refresh();
        return panel.el;
    }

    private async confirmClearAll(): Promise<void> {
        const ok = await modalService.confirm("Reset every changed setting to its default?", {
            danger: true,
            confirmLabel: "Reset",
        });
        if (ok) this.deps.onClearAll();
    }

    private refresh(): void {
        if (!this.listHost) return;
        const canUndo = this.deps.history.canUndo();
        const canRedo = this.deps.history.canRedo();
        const undoPeek = this.deps.history.peekUndo();
        const redoPeek = this.deps.history.peekRedo();
        this.undoBtn.el.disabled = !canUndo;
        this.redoBtn.el.disabled = !canRedo;
        this.undoBtn.el.title = undoPeek ? `Undo: ${describeEntry(undoPeek)}` : "Nothing to undo";
        this.redoBtn.el.title = redoPeek ? `Redo: ${describeEntry(redoPeek)}` : "Nothing to redo";

        const changed = this.deps.history.getHistoryChanges(this.deps.getSnapshot());
        this.clearBtn.el.disabled = changed.length === 0;

        if (changed.length === 0) {
            this.listHost.setChildren(
                div({ classes: [CLS_EMPTY], text: "All settings at default.", context: null, meta: null }),
            );
            return;
        }
        const sorted = [...changed].sort((a, b) => a.path.localeCompare(b.path));
        this.listHost.setChildren(...sorted.map((c) => this.makeRow(c)));
    }

    private makeRow(setting: HistoryChange): Instance {
        const labelText = `${formatPath(setting.path)} · ${formatValue(setting.currentValue)}`;
        const resetBtn = button({
            classes: [CLS_BTN, CLS_BTN_DANGER],
            text: "Reset",
            title: `Reset to ${formatValue(setting.defaultValue)}`,
            onClick: () => this.deps.onResetPath(setting.path),
            context: `reset setting ${setting.path} to default`,
            meta: ["action", "destructive"],
        });
        return div({ classes: [CLS_ROW], context: null, meta: null }, [
            span({
                classes: [CLS_ROW_NAME],
                text: labelText,
                title: `Default: ${formatValue(setting.defaultValue)}`,
                context: null,
                meta: null,
            }),
            div({ classes: [CLS_ROW_ACTIONS], context: null, meta: null }, [resetBtn]),
        ]);
    }
}
