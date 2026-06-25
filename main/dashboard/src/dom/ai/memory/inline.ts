import { button, div, effect, inlineConfirm, wireClick, type Instance } from "../../factory";
import { memoryClient, type MemoryFile, type MemoryResult } from "../../../ai/memory-client";
import { memoryStore } from "../../../state/stores/memory-store";
import { createMemoryList, type MemoryListHandle } from "./list";
import { renderEditor, emptyDraft, MODE_EDIT, MODE_CREATE, type Mode } from "./editor";
import {
    AI_MEMORY_CONTENT_CLASS,
    AI_MEMORY_INLINE_BODY_CLASS,
    AI_MEMORY_INLINE_CLASS,
    AI_MEMORY_LIST_CLASS,
    AI_MEMORY_LIST_ITEM_CLASS,
    AI_MEMORY_NEW_CLASS,
    AI_MEMORY_PLACEHOLDER_CLASS,
    AI_MEMORY_SIDEBAR_CLASS,
    AI_MEMORY_STATUS_CLASS,
    AI_MEMORY_STATUS_ERROR_CLASS,
} from "../../../shared/constants/ai-memory-constants.js";

const STATUS_CLEAR_MS = 4000;

interface MemoryWidgets {
    list: MemoryListHandle;
    content: Instance;
    status: Instance;
}

function setStatus(h: MemoryWidgets, text: string, isError = false): void {
    h.status.setText(text);
    h.status.toggleClass(AI_MEMORY_STATUS_ERROR_CLASS, isError);
    if (!text) return;
    setTimeout(() => {
        if (h.status.el.textContent === text) h.status.setText("");
    }, STATUS_CLEAR_MS);
}

function showPlaceholder(h: MemoryWidgets): void {
    h.content.setChildren(
        div({
            classes: [AI_MEMORY_PLACEHOLDER_CLASS],
            text: "Select a memory file or create a new one.",
            context: null,
            meta: null,
        }),
    );
}

async function runWriteOp(h: MemoryWidgets, successMsg: string, op: () => Promise<MemoryResult>): Promise<void> {
    try {
        const result = await op();
        if (!result.ok) {
            setStatus(h, result.error ?? "operation failed", true);
            return;
        }
        setStatus(h, successMsg);
        await memoryStore.refresh();
        showPlaceholder(h);
    } catch (err) {
        setStatus(h, (err as Error).message, true);
    }
}

function openEditor(h: MemoryWidgets, mode: Mode, file: MemoryFile): void {
    renderEditor(h.content, mode, file, {
        onCancel: () => showPlaceholder(h),
        onSave: async (draft, m) => {
            const isEdit = m === MODE_EDIT;
            await runWriteOp(h, `${isEdit ? "Updated" : "Created"} ${draft.id}`, () =>
                isEdit ? memoryClient.update(draft.id, draft) : memoryClient.create(draft),
            );
        },
        onDelete: async (id) => {
            const confirmed = await inlineConfirm(h.content, {
                cancelLabel: "Cancel",
                confirmLabel: "Delete",
                danger: true,
                cancelContext: `keep memory file "${id}"`,
                confirmContext: `confirm deleting memory file "${id}"`,
            });
            if (confirmed) await runWriteOp(h, `Deleted ${id}`, () => memoryClient.deleteById(id));
        },
    });
}

function buildMemoryRoot(
    onNew: () => void,
    onListClick: (e: MouseEvent) => void,
): { root: Instance; handles: MemoryWidgets } {
    const list = createMemoryList();
    list.el.classList.add(AI_MEMORY_LIST_CLASS);
    list.el.dataset.list = "";
    wireClick(list.el, { raw: true, handler: onListClick });
    const newBtn = button({
        classes: [AI_MEMORY_NEW_CLASS],
        text: "+ New memory",
        data: { new: "" },
        context: "create a new memory file",
        meta: ["action"],
        onClick: onNew,
    });
    const content = div({ classes: [AI_MEMORY_CONTENT_CLASS], data: { content: "" }, context: null, meta: null });
    const status = div({ classes: [AI_MEMORY_STATUS_CLASS], data: { status: "" }, context: null, meta: null });
    const sidebar = div({ classes: [AI_MEMORY_SIDEBAR_CLASS], context: null, meta: null }, [newBtn.el, list.el]);
    const body = div({ classes: [AI_MEMORY_INLINE_BODY_CLASS], context: null, meta: null }, [sidebar, content]);
    const root = div({ classes: [AI_MEMORY_INLINE_CLASS], context: null, meta: null }, [body, status]);
    return { root, handles: { list, content, status } };
}

async function openExistingMemory(handles: MemoryWidgets, e: Event): Promise<void> {
    const item = (e.target as HTMLElement).closest<HTMLElement>(`.${AI_MEMORY_LIST_ITEM_CLASS}`);
    if (!item?.dataset.id) return;
    try {
        const file = await memoryClient.get(item.dataset.id);
        openEditor(handles, MODE_EDIT, file);
    } catch (err) {
        setStatus(handles, (err as Error).message, true);
    }
}

function mountMemory(host: Instance): void {
    const handlesRef: { current: MemoryWidgets | null } = { current: null };
    const { root, handles } = buildMemoryRoot(
        () => openEditor(handlesRef.current!, MODE_CREATE, emptyDraft()),
        (e) => void openExistingMemory(handlesRef.current!, e),
    );
    handlesRef.current = handles;
    host.addChild(root);
    showPlaceholder(handles);
    handles.list.renderLoading();
    root.trackDispose(effect(() => handles.list.renderFiles(memoryStore.files$())));
    root.trackDispose({ dispose: () => handles.list.destroyAll() });
    root.trackDispose(
        effect(() => {
            const err = memoryStore.error$();
            if (err !== null) setStatus(handles, err, true);
        }),
    );
}

export { mountMemory };
