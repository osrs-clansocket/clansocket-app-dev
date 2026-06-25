export function detectUndoRedo(e: KeyboardEvent): "undo" | "redo" | null {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return null;
    const key = e.key.toLowerCase();
    if (key === "z") return e.shiftKey ? "redo" : "undo";
    if (key === "y") return "redo";
    return null;
}
